import '../../../core/api/marketplace_models.dart';

const dentalImplantProcedure = MarketplaceProcedure(
  id: 'procedure-dental-implant',
  slug: 'dental-implant',
  name: 'Dental implant',
  specialty: 'Dentistry',
  description: 'Single implant treatment with imaging and prosthetic planning.',
  requiredDocs: ['Dental X-ray', 'Medication list', 'Recent medical history'],
  verifiedOfferCount: 2,
);

const hairTransplantProcedure = MarketplaceProcedure(
  id: 'procedure-hair-transplant',
  slug: 'hair-transplant',
  name: 'Hair transplant',
  specialty: 'Dermatology',
  description: 'FUE hair restoration package with post-operative follow-up.',
  requiredDocs: ['Scalp photos', 'Medical history', 'Blood test'],
  verifiedOfferCount: 2,
);

const lasikProcedure = MarketplaceProcedure(
  id: 'procedure-lasik',
  slug: 'lasik-eye-surgery',
  name: 'LASIK eye surgery',
  specialty: 'Ophthalmology',
  description: 'Laser vision correction with eligibility screening.',
  requiredDocs: ['Eye prescription', 'Corneal topography', 'Medication list'],
  verifiedOfferCount: 2,
);

const sampleProcedures = [
  dentalImplantProcedure,
  hairTransplantProcedure,
  lasikProcedure,
];

const sampleOffers = [
  ClinicOffer(
    id: 'offer-barcelona-dental',
    clinic: ClinicSummary(
      id: 'clinic-barcelona',
      name: 'Barcelona Dental Institute',
      countryCode: 'ES',
      verificationStatus: 'VERIFIED',
    ),
    procedure: dentalImplantProcedure,
    price: OfferPrice(
      basePriceCents: 180000,
      currencyCode: 'EUR',
      includedItems: ['Initial consult', '3D scan', 'Implant placement'],
      excludedItems: ['Flights', 'Hotel'],
    ),
    availability: 'Next consult: 12 Jul',
    estimate: CostEstimate(
      currencyCode: 'EUR',
      procedurePriceCents: 180000,
      estimatedFlightCents: 18000,
      estimatedHotelCents: 45000,
      estimatedTransferCents: 4500,
      estimatedTotalCents: 247500,
      assumptions: [
        'Patient origin defaults to EU/UK regional estimate.',
        '5 hotel nights estimated for MVP comparison.',
      ],
      isEstimate: true,
    ),
  ),
  ClinicOffer(
    id: 'offer-istanbul-smile',
    clinic: ClinicSummary(
      id: 'clinic-istanbul-smile',
      name: 'Istanbul Smile Clinic',
      countryCode: 'TR',
      verificationStatus: 'VERIFIED',
    ),
    procedure: dentalImplantProcedure,
    price: OfferPrice(
      basePriceCents: 125000,
      currencyCode: 'EUR',
      includedItems: [
        'Initial consult',
        'Panoramic X-ray',
        'Implant placement',
      ],
      excludedItems: ['Flights', 'Hotel', 'Translation'],
    ),
    availability: 'Next consult: 18 Jul',
    estimate: CostEstimate(
      currencyCode: 'EUR',
      procedurePriceCents: 125000,
      estimatedFlightCents: 26000,
      estimatedHotelCents: 37500,
      estimatedTransferCents: 4000,
      estimatedTotalCents: 192500,
      assumptions: [
        'Patient origin defaults to EU/UK regional estimate.',
        '5 hotel nights estimated for MVP comparison.',
      ],
      isEstimate: true,
    ),
  ),
  ClinicOffer(
    id: 'offer-london-vision',
    clinic: ClinicSummary(
      id: 'clinic-london-vision',
      name: 'London Vision Centre',
      countryCode: 'GB',
      verificationStatus: 'VERIFIED',
    ),
    procedure: lasikProcedure,
    price: OfferPrice(
      basePriceCents: 230000,
      currencyCode: 'EUR',
      includedItems: ['Eligibility exam', 'LASIK procedure', '1 follow-up'],
      excludedItems: ['Travel', 'Companion stay'],
    ),
    availability: 'Next consult: 08 Aug',
    estimate: CostEstimate(
      currencyCode: 'EUR',
      procedurePriceCents: 230000,
      estimatedFlightCents: 22000,
      estimatedHotelCents: 65000,
      estimatedTransferCents: 5500,
      estimatedTotalCents: 322500,
      assumptions: [
        'Patient origin defaults to EU/UK regional estimate.',
        '5 hotel nights estimated for MVP comparison.',
      ],
      isEstimate: true,
    ),
  ),
  ClinicOffer(
    id: 'offer-paris-hair',
    clinic: ClinicSummary(
      id: 'clinic-paris-hair',
      name: 'Paris Hair Restoration',
      countryCode: 'FR',
      verificationStatus: 'VERIFIED',
    ),
    procedure: hairTransplantProcedure,
    price: OfferPrice(
      basePriceCents: 260000,
      currencyCode: 'EUR',
      includedItems: ['Doctor assessment', 'FUE session', 'Recovery kit'],
      excludedItems: ['Flights', 'Hotel'],
    ),
    availability: 'Next consult: 29 Jul',
    estimate: CostEstimate(
      currencyCode: 'EUR',
      procedurePriceCents: 260000,
      estimatedFlightCents: 15000,
      estimatedHotelCents: 57500,
      estimatedTransferCents: 5000,
      estimatedTotalCents: 337500,
      assumptions: [
        'Patient origin defaults to EU/UK regional estimate.',
        '5 hotel nights estimated for MVP comparison.',
      ],
      isEstimate: true,
    ),
  ),
];
