import * as fs from 'node:fs';
import * as path from 'node:path';
import { BiologicalSex, PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

loadEnvFiles([
  path.resolve(__dirname, '..', '..', '..', '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(process.cwd(), '.env'),
]);

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMeMvp2026!', 12);
  const demoPatientProfile = {
    fullName: 'Demo Patient',
    countryCode: 'FR',
    residenceCity: 'Paris',
    languageCode: 'en',
    currencyCode: 'EUR',
    biologicalSex: BiologicalSex.UNKNOWN,
    genderIdentity: 'prefer_not_to_say',
    latitude: 48.8566,
    longitude: 2.3522,
    travelRadiusKm: 2500,
    travelPreferences: {
      preferredDestinationCountryCode: 'ES',
      travelRadiusKm: 2500,
    },
    medicalHistory: {
      summary: 'Interested in comparing elective care options in Europe.',
      conditions: ['mild seasonal asthma'],
      previousProcedures: [],
    },
    allergies: {
      items: ['penicillin'],
    },
    currentMedication: {
      items: [
        {
          name: 'Salbutamol inhaler',
          instructions: 'As needed',
        },
      ],
    },
  };

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
    update: {
      phone: '+33100000001',
      patientProfile: {
        upsert: {
          update: demoPatientProfile,
          create: demoPatientProfile,
        },
      },
    },
    create: {
      email: 'patient.demo@medtour.local',
      phone: '+33100000001',
      passwordHash,
      roles: [UserRole.PATIENT],
      mfaEnabled: false,
      patientProfile: {
        create: demoPatientProfile,
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

  const procedures = await seedProcedures();
  const clinics = await seedClinics(clinicUser.id);

  await seedClinicPricing(clinics[0].id, procedures);
  await seedClinicPricing(clinics[1].id, procedures);

  await prisma.auditLog.create({
    data: {
      actorUserId: admin.id,
      action: 'DATABASE_SEEDED',
      resourceType: 'System',
      purpose: 'LOCAL_DEVELOPMENT',
      metadata: {
        users: ['admin@medtour.local', 'patient.demo@medtour.local', 'clinic.demo@medtour.local'],
        password: 'ChangeMeMvp2026!',
      },
    },
  });
}

async function seedCoreConsents(userId: string) {
  const purposes = [
    'DOCUMENT_UPLOAD',
    'AI_ANALYSIS',
    'CLINIC_SHARING',
    'MEDICATION_FOLLOW_UP',
  ] as const;

  for (const purpose of purposes) {
    await prisma.consent.create({
      data: {
        userId,
        purpose,
        metadata: {
          source: 'seed',
          note: 'Demo consent for local MVP workflows only.',
        },
      },
    });
  }
}

async function seedProcedures() {
  const data = [
    {
      slug: 'dental-implant',
      specialty: 'Dental care',
      name: 'Dental implant',
      description: 'Elective dental implant procedure with pre-assessment and follow-up requirements.',
      requiredDocs: ['dental panoramic X-ray', 'medical history', 'current medication list'],
      medicalCodes: { snomed: ['427562005'] },
    },
    {
      slug: 'cataract-surgery',
      specialty: 'Ophthalmology',
      name: 'Cataract surgery',
      description: 'Non-emergency lens replacement procedure requiring ophthalmology evaluation.',
      requiredDocs: ['ophthalmology report', 'visual acuity test', 'medical history'],
      medicalCodes: { snomed: ['54885007'] },
    },
    {
      slug: 'rhinoplasty',
      specialty: 'Cosmetic surgery',
      name: 'Rhinoplasty',
      description: 'Elective cosmetic surgery workflow with quote, consultation and recovery monitoring.',
      requiredDocs: ['medical history', 'photos requested by clinic', 'current medication list'],
      medicalCodes: { snomed: ['387704003'] },
    },
  ];

  return Promise.all(
    data.map((procedure) =>
      prisma.procedure.upsert({
        where: { slug: procedure.slug },
        update: procedure,
        create: procedure,
      }),
    ),
  );
}

async function seedClinics(clinicUserId: string) {
  const data = [
    {
      name: 'Barcelona Vision & Dental Clinic',
      countryCode: 'ES',
    },
    {
      name: 'Paris Elective Care Center',
      countryCode: 'FR',
    },
  ];

  const clinics = [];

  for (const clinic of data) {
    const created = await prisma.clinic.upsert({
      where: {
        id: await getExistingClinicId(clinic.name),
      },
      update: {
        countryCode: clinic.countryCode,
        verificationStatus: 'VERIFIED',
        publishedAt: new Date(),
      },
      create: {
        ...clinic,
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

    clinics.push(created);
  }

  return clinics;
}

async function getExistingClinicId(name: string) {
  const existing = await prisma.clinic.findFirst({ where: { name } });
  return existing?.id ?? '00000000-0000-0000-0000-000000000000';
}

async function seedClinicPricing(
  clinicId: string,
  procedures: Awaited<ReturnType<typeof seedProcedures>>,
) {
  const priceBySlug: Record<string, number> = {
    'dental-implant': 140000,
    'cataract-surgery': 210000,
    rhinoplasty: 360000,
  };

  for (const procedure of procedures) {
    await prisma.clinicProcedure.upsert({
      where: {
        clinicId_procedureId: {
          clinicId,
          procedureId: procedure.id,
        },
      },
      update: {
        basePriceCents: priceBySlug[procedure.slug],
        currencyCode: 'EUR',
      },
      create: {
        clinicId,
        procedureId: procedure.id,
        basePriceCents: priceBySlug[procedure.slug],
        currencyCode: 'EUR',
        includedItems: ['clinic consultation', 'procedure', 'standard follow-up'],
        excludedItems: ['flight', 'hotel', 'visa', 'companion costs', 'complication insurance'],
        availability: {
          nextAvailableMonth: '2026-09',
          consultationModes: ['video'],
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

function loadEnvFiles(filePaths: string[]) {
  for (const filePath of filePaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match) {
        continue;
      }

      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) {
        continue;
      }

      process.env[key] = unquoteEnvValue(rawValue.trim());
    }
  }
}

function unquoteEnvValue(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
