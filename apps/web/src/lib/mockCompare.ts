export const MOCK_COMPARE_DATA = [
  {
    id: 'mock-1',
    clinic: { id: 'c1', name: 'BarcelonaCare Dental & Vision', countryCode: 'ES' },
    procedure: { name: 'Cataract Surgery', specialty: 'Ophthalmology' },
    basePriceCents: 98000, currencyCode: 'EUR',
    includedItems: ['Clinic consultation', 'Procedure', 'Standard follow-up', 'IOL lens'],
    excludedItems: ['Flight', 'Hotel', 'Visa'],
    costEstimate: { procedureCents: 98000, flightCents: 22000, hotelCents: 31500, transferCents: 8000, totalCents: 159500, currency: 'EUR' }
  },
  {
    id: 'mock-2',
    clinic: { id: 'c2', name: 'Prague Eye & Aesthetic Clinic', countryCode: 'CZ' },
    procedure: { name: 'Cataract Surgery', specialty: 'Ophthalmology' },
    basePriceCents: 79000, currencyCode: 'EUR',
    includedItems: ['Consultation', 'Surgery', '1-night stay', 'Post-op kit'],
    excludedItems: ['Flight', 'Hotel'],
    costEstimate: { procedureCents: 79000, flightCents: 18000, hotelCents: 22000, transferCents: 6000, totalCents: 125000, currency: 'EUR' }
  },
  {
    id: 'mock-3',
    clinic: { id: 'c3', name: 'Istanbul Premium Medical', countryCode: 'TR' },
    procedure: { name: 'Cataract Surgery', specialty: 'Ophthalmology' },
    basePriceCents: 65000, currencyCode: 'EUR',
    includedItems: ['Implant + crown', 'X-rays', '2 consultations', '5-year guarantee'],
    excludedItems: ['Flight', 'Hotel', 'Bone graft if needed'],
    costEstimate: { procedureCents: 65000, flightCents: 19000, hotelCents: 18000, transferCents: 5000, totalCents: 107000, currency: 'EUR' }
  },
  {
    id: 'mock-4',
    clinic: { id: 'c4', name: 'Paris Elective Care Centre', countryCode: 'FR' },
    procedure: { name: 'Cataract Surgery', specialty: 'Ophthalmology' },
    basePriceCents: 185000, currencyCode: 'EUR',
    includedItems: ['Surgeon fee', 'Anaesthesia', 'Clinic stay 2 nights', 'Post-op'],
    excludedItems: ['Flight', 'Hotel'],
    costEstimate: { procedureCents: 185000, flightCents: 12000, hotelCents: 28000, transferCents: 8000, totalCents: 233000, currency: 'EUR' }
  },
]
