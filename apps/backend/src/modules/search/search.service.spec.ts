import { BadRequestException } from '@nestjs/common';
import { SearchService } from './search.service';

describe('SearchService', () => {
  const prisma = {
    clinicProcedure: {
      findMany: jest.fn(),
    },
  };
  const costEstimation = {
    estimateTotalCost: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects comparison requests with more than four offers', async () => {
    const service = new SearchService(prisma as never, costEstimation as never);

    await expect(
      service.compareOffers('offer-1,offer-2,offer-3,offer-4,offer-5'),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.clinicProcedure.findMany).not.toHaveBeenCalled();
  });

  it('preserves the requested offer order for comparison results', async () => {
    const service = new SearchService(prisma as never, costEstimation as never);
    prisma.clinicProcedure.findMany.mockResolvedValue([
      buildOffer('offer-2', 'Clinic B', 200000),
      buildOffer('offer-1', 'Clinic A', 100000),
    ]);
    costEstimation.estimateTotalCost.mockReturnValue({
      currencyCode: 'EUR',
      procedurePriceCents: 100000,
      estimatedFlightCents: 10000,
      estimatedHotelCents: 20000,
      estimatedTransferCents: 5000,
      estimatedTotalCents: 135000,
      assumptions: [],
      isEstimate: true,
    });

    const result = await service.compareOffers('offer-1,offer-2');

    expect(result.offers.map((offer) => offer.id)).toEqual(['offer-1', 'offer-2']);
  });
});

function buildOffer(id: string, clinicName: string, basePriceCents: number) {
  return {
    id,
    clinicId: `${id}-clinic`,
    procedureId: `${id}-procedure`,
    basePriceCents,
    currencyCode: 'EUR',
    includedItems: [],
    excludedItems: [],
    availability: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    clinic: {
      id: `${id}-clinic`,
      name: clinicName,
      countryCode: 'ES',
      verificationStatus: 'VERIFIED',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    procedure: {
      id: `${id}-procedure`,
      specialty: 'Dental care',
      slug: 'dental-implant',
      name: 'Dental implant',
      description: 'Demo procedure',
      requiredDocs: [],
      medicalCodes: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

