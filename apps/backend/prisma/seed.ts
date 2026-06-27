import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMeMvp2026!', 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medtour.local' },
    update: {},
    create: {
      email: 'admin@medtour.local',
      passwordHash,
      roles: [UserRole.ADMIN, UserRole.DPO],
      mfaEnabled: true,
    },
  });

  const patient = await prisma.user.upsert({
    where: { email: 'patient.demo@medtour.local' },
    update: {},
    create: {
      email: 'patient.demo@medtour.local',
      phone: '+441234567890',
      passwordHash,
      roles: [UserRole.PATIENT],
      mfaEnabled: false,
      patientProfile: {
        create: {
          countryCode: 'GB',
          languageCode: 'en',
          currencyCode: 'GBP',
          biologicalSex: 'MALE',
          medicalHistory: {
            conditions: ['Hypertension Stage 1', 'Type 2 Diabetes (diet controlled)', 'Paroxysmal AF'],
            previousProcedures: ['Appendectomy 2008', 'Knee arthroscopy 2019'],
          },
          allergies: {
            items: ['Penicillin (anaphylaxis)', 'Aspirin (mild)'],
          },
          currentMedication: {
            items: [
              { name: 'Warfarin 5mg', instructions: 'Daily — INR monitoring required' },
              { name: 'Metoprolol 50mg', instructions: 'Daily' },
              { name: 'Atorvastatin 20mg', instructions: 'Nightly' },
            ],
          },
        },
      },
    },
  });

  await seedCoreConsents(patient.id);

  const clinicUser = await prisma.user.upsert({
    where: { email: 'clinic.demo@medtour.local' },
    update: {},
    create: {
      email: 'clinic.demo@medtour.local',
      passwordHash,
      roles: [UserRole.CLINIC],
      mfaEnabled: true,
    },
  });

  // ── Procedures ─────────────────────────────────────────────────────────────
  const procedures = await seedProcedures();

  // ── Clinics ────────────────────────────────────────────────────────────────
  const clinics = await seedClinics(clinicUser.id);

  // Seed pricing for all clinics
  for (const clinic of clinics) {
    await seedClinicPricing(clinic.id, clinic.countryCode, procedures);
  }

  // ── Demo quote request ─────────────────────────────────────────────────────
  await seedDemoQuoteRequest(patient.id, clinics[0].id, procedures);

  // ── Audit log ─────────────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: 'DATABASE_SEEDED',
      resourceType: 'System',
      purpose: 'LOCAL_DEVELOPMENT',
      metadata: {
        users: ['admin@medtour.local', 'patient.demo@medtour.local', 'clinic.demo@medtour.local'],
        clinics: clinics.map((c) => c.name),
        password: 'ChangeMeMvp2026!',
      },
    },
  });

  console.log('\n✅ Seed complete');
  console.log(`   ${clinics.length} clinics seeded across ES, FR, CZ, TR, PL, DE`);
  console.log(`   ${procedures.length} procedures seeded`);
  console.log('   Demo accounts: admin@ · patient.demo@ · clinic.demo@');
  console.log('   Password: ChangeMeMvp2026!\n');
}

// ── Consents ────────────────────────────────────────────────────────────────
async function seedCoreConsents(userId: string) {
  const purposes = ['DOCUMENT_UPLOAD', 'AI_ANALYSIS', 'CLINIC_SHARING', 'MEDICATION_FOLLOW_UP'] as const;
  for (const purpose of purposes) {
    const existing = await prisma.consent.findFirst({ where: { userId, purpose } });
    if (!existing) {
      await prisma.consent.create({
        data: {
          userId,
          purpose,
          metadata: { source: 'seed', note: 'Demo consent for local MVP workflows only.' },
        },
      });
    }
  }
}

// ── Procedures ──────────────────────────────────────────────────────────────
async function seedProcedures() {
  const data = [
    {
      slug: 'cataract-surgery',
      specialty: 'Ophthalmology',
      name: 'Cataract Surgery',
      description: 'Lens replacement surgery (phacoemulsification) for grade 2–4 cataracts. Outpatient, 2–3 hr stay.',
      requiredDocs: ['ophthalmology report', 'visual acuity test', 'blood tests', 'medical history'],
      medicalCodes: { snomed: ['54885007'], icd10: ['H26.9'] },
    },
    {
      slug: 'dental-implant',
      specialty: 'Dental care',
      name: 'Dental Implant (Single)',
      description: 'Titanium implant with crown. Includes bone density assessment, implant, and ceramic crown fitting.',
      requiredDocs: ['dental panoramic X-ray', 'CT scan', 'medical history', 'current medication list'],
      medicalCodes: { snomed: ['427562005'], icd10: ['K08.109'] },
    },
    {
      slug: 'rhinoplasty',
      specialty: 'Cosmetic surgery',
      name: 'Rhinoplasty',
      description: 'Functional or cosmetic nose reshaping. Includes pre-op consultation, procedure, and post-op follow-up.',
      requiredDocs: ['medical history', 'current medication list', 'photos', 'ECG if over 40'],
      medicalCodes: { snomed: ['387704003'], icd10: ['Z41.1'] },
    },
    {
      slug: 'hip-replacement',
      specialty: 'Orthopaedics',
      name: 'Total Hip Replacement',
      description: 'Total hip arthroplasty (THA). Includes pre-op assessment, surgery, inpatient stay, and physiotherapy.',
      requiredDocs: ['hip X-ray', 'MRI scan', 'blood tests', 'cardiology clearance', 'medical history'],
      medicalCodes: { snomed: ['52734007'], icd10: ['Z96.641'] },
    },
    {
      slug: 'knee-replacement',
      specialty: 'Orthopaedics',
      name: 'Total Knee Replacement',
      description: 'Total knee arthroplasty (TKA). Includes pre-op assessment, surgery, inpatient stay, and physiotherapy.',
      requiredDocs: ['knee X-ray', 'MRI scan', 'blood tests', 'cardiology clearance', 'medical history'],
      medicalCodes: { snomed: ['179294005'], icd10: ['Z96.651'] },
    },
    {
      slug: 'hair-transplant',
      specialty: 'Hair restoration',
      name: 'FUE Hair Transplant',
      description: 'Follicular Unit Extraction — 2,000–4,000 grafts. Includes donor assessment, transplant, and aftercare kit.',
      requiredDocs: ['scalp photos', 'blood tests (iron, thyroid)', 'medical history'],
      medicalCodes: { snomed: ['703985002'], icd10: ['L65.9'] },
    },
    {
      slug: 'gastric-sleeve',
      specialty: 'Bariatric surgery',
      name: 'Gastric Sleeve (Sleeve Gastrectomy)',
      description: 'Laparoscopic sleeve gastrectomy for BMI 35+. Includes pre-op diet, surgery, and 6-month follow-up.',
      requiredDocs: ['BMI & nutrition assessment', 'blood panel', 'psychological clearance', 'gastroscopy'],
      medicalCodes: { snomed: ['442338001'], icd10: ['Z68.35'] },
    },
    {
      slug: 'ivf',
      specialty: 'Fertility',
      name: 'IVF Treatment (1 cycle)',
      description: 'Complete IVF cycle including stimulation, egg retrieval, fertilisation, and embryo transfer.',
      requiredDocs: ['AMH test', 'sperm analysis', 'uterine scan', 'hormone panel', 'medical history'],
      medicalCodes: { snomed: ['52637005'], icd10: ['Z31.83'] },
    },
  ];

  return Promise.all(
    data.map((p) =>
      prisma.procedure.upsert({
        where: { slug: p.slug },
        update: p,
        create: p,
      }),
    ),
  );
}

// ── Clinics ──────────────────────────────────────────────────────────────────
const CLINIC_DATA = [
  {
    name: 'Barcelona Vision Center',
    countryCode: 'ES',
    city: 'Barcelona',
    rating: 4.8,
    reviewCount: 312,
    languages: ['en', 'es', 'fr', 'de'],
    accreditations: ['JCI Accredited', 'ISO 9001:2015'],
    specialties: ['Ophthalmology', 'Dental care', 'Cosmetic surgery'],
    description: 'Leading ophthalmology and dental clinic in Barcelona with 25+ years of experience treating international patients.',
    consultationModes: ['video', 'in-person'],
    nextAvailableMonth: '2026-08',
  },
  {
    name: 'Paris Elective Care Center',
    countryCode: 'FR',
    city: 'Paris',
    rating: 4.6,
    reviewCount: 189,
    languages: ['en', 'fr', 'es', 'ar'],
    accreditations: ['HAS Certified', 'ISO 9001:2015'],
    specialties: ['Cosmetic surgery', 'Orthopaedics', 'Fertility'],
    description: 'Premier elective care facility in central Paris, specialising in cosmetic and orthopaedic procedures.',
    consultationModes: ['video', 'in-person'],
    nextAvailableMonth: '2026-09',
  },
  {
    name: 'Prague Eye & Aesthetic Institute',
    countryCode: 'CZ',
    city: 'Prague',
    rating: 4.7,
    reviewCount: 428,
    languages: ['en', 'de', 'ru', 'cs'],
    accreditations: ['ISO 9001:2015', 'Czech Health Ministry Certified'],
    specialties: ['Ophthalmology', 'Cosmetic surgery', 'Hair restoration'],
    description: 'State-of-the-art eye surgery and aesthetics clinic in Prague Old Town, highly rated by European patients.',
    consultationModes: ['video'],
    nextAvailableMonth: '2026-08',
  },
  {
    name: 'Istanbul Medical Arts Clinic',
    countryCode: 'TR',
    city: 'Istanbul',
    rating: 4.9,
    reviewCount: 1024,
    languages: ['en', 'ar', 'de', 'fr', 'tr'],
    accreditations: ['JCI Accredited', 'ISO 9001:2015', 'TEMOS Certified'],
    specialties: ['Hair restoration', 'Cosmetic surgery', 'Bariatric surgery', 'Dental care'],
    description: 'Turkey\'s most-reviewed international hospital, renowned for world-class hair transplant and cosmetic surgery.',
    consultationModes: ['video', 'in-person', 'chat'],
    nextAvailableMonth: '2026-07',
  },
  {
    name: 'Warsaw Medicover International',
    countryCode: 'PL',
    city: 'Warsaw',
    rating: 4.6,
    reviewCount: 267,
    languages: ['en', 'de', 'pl', 'ru'],
    accreditations: ['ISO 9001:2015', 'Joint Commission International'],
    specialties: ['Orthopaedics', 'Dental care', 'Fertility', 'Bariatric surgery'],
    description: 'Poland\'s leading international medical centre offering orthopaedic, dental, and fertility treatments.',
    consultationModes: ['video', 'in-person'],
    nextAvailableMonth: '2026-08',
  },
  {
    name: 'Berlin Precision Surgical Center',
    countryCode: 'DE',
    city: 'Berlin',
    rating: 4.7,
    reviewCount: 156,
    languages: ['en', 'de', 'fr'],
    accreditations: ['DIN EN ISO 9001', 'Deutsche Gesellschaft für Chirurgie'],
    specialties: ['Orthopaedics', 'Ophthalmology', 'Bariatric surgery'],
    description: 'German precision medicine at competitive international prices. Fully bilingual team (EN/DE).',
    consultationModes: ['video', 'in-person'],
    nextAvailableMonth: '2026-09',
  },
];

async function seedClinics(clinicUserId: string) {
  const clinics = [];

  for (const data of CLINIC_DATA) {
    const existing = await prisma.clinic.findFirst({ where: { name: data.name } });

    const clinic = await prisma.clinic.upsert({
      where: { id: existing?.id ?? '00000000-0000-0000-0000-000000000000' },
      update: {
        countryCode: data.countryCode,
        verificationStatus: 'VERIFIED',
        publishedAt: new Date(),
      },
      create: {
        name: data.name,
        countryCode: data.countryCode,
        verificationStatus: 'VERIFIED',
        publishedAt: new Date(),
        members: {
          create: {
            userId: clinicUserId,
            role: UserRole.CLINIC,
          },
        },
      },
    });

    clinics.push({ ...clinic, countryCode: data.countryCode });
  }

  return clinics;
}

// ── Clinic pricing per country ───────────────────────────────────────────────
// Prices are in EUR cents. UK market prices are ~3–6x these.
const PRICING: Record<string, Record<string, number>> = {
  ES: {
    'cataract-surgery': 98000,      // €980 vs ~€4,000 UK
    'dental-implant': 85000,        // €850 vs ~€2,500 UK
    'rhinoplasty': 320000,          // €3,200 vs ~€7,000 UK
    'hip-replacement': 720000,      // €7,200 vs ~€18,000 UK
    'knee-replacement': 680000,     // €6,800 vs ~€16,500 UK
    'hair-transplant': 190000,      // €1,900 vs ~€8,000 UK
    'gastric-sleeve': 580000,       // €5,800 vs ~€12,000 UK
    'ivf': 240000,                  // €2,400 vs ~€6,000 UK
  },
  FR: {
    'cataract-surgery': 160000,
    'dental-implant': 140000,
    'rhinoplasty': 450000,
    'hip-replacement': 980000,
    'knee-replacement': 920000,
    'hair-transplant': 350000,
    'gastric-sleeve': 820000,
    'ivf': 380000,
  },
  CZ: {
    'cataract-surgery': 72000,
    'dental-implant': 60000,
    'rhinoplasty': 280000,
    'hip-replacement': 580000,
    'knee-replacement': 540000,
    'hair-transplant': 150000,
    'gastric-sleeve': 490000,
    'ivf': 200000,
  },
  TR: {
    'cataract-surgery': 65000,
    'dental-implant': 45000,
    'rhinoplasty': 210000,
    'hip-replacement': 480000,
    'knee-replacement': 440000,
    'hair-transplant': 85000,       // Turkey is the world leader here
    'gastric-sleeve': 380000,
    'ivf': 160000,
  },
  PL: {
    'cataract-surgery': 75000,
    'dental-implant': 55000,
    'rhinoplasty': 260000,
    'hip-replacement': 560000,
    'knee-replacement': 520000,
    'hair-transplant': 170000,
    'gastric-sleeve': 510000,
    'ivf': 220000,
  },
  DE: {
    'cataract-surgery': 145000,
    'dental-implant': 130000,
    'rhinoplasty': 420000,
    'hip-replacement': 890000,
    'knee-replacement': 840000,
    'hair-transplant': 320000,
    'gastric-sleeve': 760000,
    'ivf': 360000,
  },
};

const INCLUDED_ITEMS: Record<string, string[]> = {
  'cataract-surgery': ['Pre-op ophthalmology consultation', 'Surgery (phacoemulsification)', 'Premium monofocal IOL lens', 'Eye drops kit (4-week supply)', '2 post-op follow-up appointments'],
  'dental-implant': ['CT scan & bone assessment', 'Titanium implant (Nobel Biocare)', 'Ceramic crown', 'Local anaesthesia', '1-year warranty'],
  'rhinoplasty': ['Pre-op consultation & 3D simulation', 'Surgical procedure', 'General anaesthesia', 'Hospital stay (1 night)', 'Post-op dressings', '1-month follow-up'],
  'hip-replacement': ['Pre-op assessment', 'Total hip arthroplasty', 'Cementless titanium implant', 'General anaesthesia', '3 nights inpatient', 'Physiotherapy (5 sessions)', '6-week follow-up'],
  'knee-replacement': ['Pre-op assessment & X-rays', 'Total knee arthroplasty', 'Cemented implant system', 'General anaesthesia', '3 nights inpatient', 'Physiotherapy (5 sessions)'],
  'hair-transplant': ['Scalp analysis & graft planning', 'FUE extraction & implantation (2,500–3,500 grafts)', 'PRP treatment', 'Aftercare kit', '6-month online follow-up'],
  'gastric-sleeve': ['Pre-op nutritional assessment', 'Laparoscopic sleeve gastrectomy', 'General anaesthesia', '2 nights inpatient', 'Post-op diet programme', '6-month virtual follow-up'],
  'ivf': ['Hormonal stimulation monitoring', 'Egg retrieval (OPU)', 'ICSI fertilisation', 'Embryo culture (up to Day 5)', 'Embryo transfer', 'Pregnancy test'],
};

async function seedClinicPricing(
  clinicId: string,
  countryCode: string,
  procedures: Awaited<ReturnType<typeof seedProcedures>>,
) {
  const prices = PRICING[countryCode] ?? PRICING.ES;

  for (const procedure of procedures) {
    const price = prices[procedure.slug];
    if (!price) continue;

    await prisma.clinicProcedure.upsert({
      where: { clinicId_procedureId: { clinicId, procedureId: procedure.id } },
      update: { basePriceCents: price },
      create: {
        clinicId,
        procedureId: procedure.id,
        basePriceCents: price,
        currencyCode: 'EUR',
        includedItems: INCLUDED_ITEMS[procedure.slug] ?? ['Consultation', 'Procedure', 'Standard follow-up'],
        excludedItems: ['Flights', 'Hotel', 'Travel insurance', 'Visa fees', 'Companion costs'],
        availability: {
          nextAvailableMonth: '2026-08',
          consultationModes: ['video'],
          typicalStayDays: procedure.slug.includes('replace') ? 7 : 2,
        },
      },
    });
  }
}

// ── Demo quote request ───────────────────────────────────────────────────────
async function seedDemoQuoteRequest(
  patientUserId: string,
  clinicId: string,
  procedures: Awaited<ReturnType<typeof seedProcedures>>,
) {
  const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
  if (!patientProfile) return;

  const cataract = procedures.find((p) => p.slug === 'cataract-surgery');
  if (!cataract) return;

  const existing = await prisma.quoteRequest.findFirst({
    where: { patientId: patientProfile.id, procedureId: cataract.id },
  });
  if (existing) return;

  await prisma.quoteRequest.create({
    data: {
      patientId: patientProfile.id,
      procedureId: cataract.id,
      clinicId,
      status: 'SUBMITTED',
      quotes: {
        create: {
          totalPriceCents: 98000,
          currencyCode: 'EUR',
          validityEndsAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
          includedItems: INCLUDED_ITEMS['cataract-surgery'],
          excludedItems: ['Flights', 'Hotel', 'Travel insurance'],
          status: 'SENT',
        },
      },
    },
  });
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
