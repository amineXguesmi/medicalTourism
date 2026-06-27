import { BadRequestException } from '@nestjs/common';
import { QuoteRequestStatus } from '@prisma/client';
import { QuoteRequestsService } from './quote-requests.service';

describe('QuoteRequestsService', () => {
  const prisma = {
    patientProfile: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    clinicProcedure: {
      findMany: jest.fn(),
    },
    quoteRequest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const audit = {
    record: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );
  });

  it('requires anti-bypass terms before creating quote requests', async () => {
    const service = new QuoteRequestsService(prisma as never, audit as never);

    await expect(
      service.create('user-1', {
        offerIds: ['offer-1'],
        antiBypassTermsAccepted: false,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.patientProfile.upsert).not.toHaveBeenCalled();
    expect(prisma.quoteRequest.create).not.toHaveBeenCalled();
  });

  it('rejects unavailable or unpublished offers', async () => {
    const service = new QuoteRequestsService(prisma as never, audit as never);
    prisma.patientProfile.upsert.mockResolvedValue({ id: 'patient-1' });
    prisma.clinicProcedure.findMany.mockResolvedValue([]);

    await expect(
      service.create('user-1', {
        offerIds: ['offer-1'],
        antiBypassTermsAccepted: true,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.quoteRequest.create).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('creates submitted requests in selected offer order and records audit logs', async () => {
    const service = new QuoteRequestsService(prisma as never, audit as never);
    const firstOffer = buildOffer('offer-1', 'clinic-1', 'procedure-1');
    const secondOffer = buildOffer('offer-2', 'clinic-2', 'procedure-2');
    prisma.patientProfile.upsert.mockResolvedValue({ id: 'patient-1' });
    prisma.clinicProcedure.findMany.mockResolvedValue([secondOffer, firstOffer]);
    prisma.quoteRequest.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: `request-${data.clinicId}`,
        ...data,
        clinic: { id: data.clinicId },
        procedure: { id: data.procedureId },
        conversations: [],
      }),
    );

    const result = await service.create('user-1', {
      offerIds: ['offer-1', 'offer-2'],
      antiBypassTermsAccepted: true,
      patientMessage: 'I can travel in August.',
    });

    expect(result.count).toBe(2);
    expect(result.quoteRequests.map((request) => request.clinicId)).toEqual([
      'clinic-1',
      'clinic-2',
    ]);
    expect(prisma.quoteRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          patientId: 'patient-1',
          clinicId: 'clinic-1',
          procedureId: 'procedure-1',
          status: QuoteRequestStatus.SUBMITTED,
          conversations: expect.any(Object),
        }),
      }),
    );
    expect(audit.record).toHaveBeenCalledTimes(2);
  });
});

function buildOffer(id: string, clinicId: string, procedureId: string) {
  return {
    id,
    clinicId,
    procedureId,
    basePriceCents: 100000,
    currencyCode: 'EUR',
    includedItems: [],
    excludedItems: [],
    availability: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    clinic: {
      id: clinicId,
      name: 'Clinic',
      countryCode: 'ES',
      verificationStatus: 'VERIFIED',
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    procedure: {
      id: procedureId,
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
