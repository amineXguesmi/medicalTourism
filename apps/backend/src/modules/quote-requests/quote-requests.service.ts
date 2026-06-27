import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, QuoteRequestStatus } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateQuoteRequestsDto } from './dto/create-quote-requests.dto';

type OfferWithRelations = Prisma.ClinicProcedureGetPayload<{
  include: {
    clinic: true;
    procedure: true;
  };
}>;

const verifiedPublishedOfferWhere = {
  clinic: {
    verificationStatus: 'VERIFIED',
    publishedAt: { not: null },
  },
} satisfies Prisma.ClinicProcedureWhereInput;

@Injectable()
export class QuoteRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listMine(userId: string) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!patient) {
      return { count: 0, quoteRequests: [] };
    }

    const quoteRequests = await this.prisma.quoteRequest.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
      include: {
        clinic: true,
        procedure: true,
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      count: quoteRequests.length,
      quoteRequests,
    };
  }

  async findMineById(id: string, userId: string) {
    const quoteRequest = await this.prisma.quoteRequest.findFirst({
      where: {
        id,
        patient: { userId },
      },
      include: {
        clinic: true,
        procedure: true,
        documentShares: true,
        quotes: true,
        conversations: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!quoteRequest) {
      throw new NotFoundException('Quote request not found.');
    }

    return quoteRequest;
  }

  async create(userId: string, dto: CreateQuoteRequestsDto) {
    if (!dto.antiBypassTermsAccepted) {
      throw new BadRequestException('Anti-bypass terms must be accepted.');
    }

    const offerIds = this.getUniqueOfferIds(dto.offerIds);
    const patient = await this.prisma.patientProfile.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const offers = await this.findVerifiedOffers(offerIds);

    if (offers.length !== offerIds.length) {
      throw new BadRequestException('One or more selected offers are unavailable.');
    }

    const offersById = new Map(offers.map((offer) => [offer.id, offer]));
    const orderedOffers = offerIds.map((offerId) => offersById.get(offerId)!);
    const patientMessage = dto.patientMessage?.trim();

    const created = await this.prisma.$transaction(
      orderedOffers.map((offer) =>
        this.prisma.quoteRequest.create({
          data: {
            patientId: patient.id,
            clinicId: offer.clinicId,
            procedureId: offer.procedureId,
            status: QuoteRequestStatus.SUBMITTED,
            ...(patientMessage
              ? {
                  conversations: {
                    create: {
                      messages: {
                        create: {
                          senderUserId: userId,
                          bodyMasked: patientMessage,
                          maskingMetadata: {
                            source: 'quote_request_intake',
                          },
                        },
                      },
                    },
                  },
                }
              : {}),
          },
          include: {
            clinic: true,
            procedure: true,
            conversations: {
              include: {
                messages: true,
              },
            },
          },
        }),
      ),
    );

    await Promise.all(
      created.map((quoteRequest) =>
        this.audit.record({
          actorUserId: userId,
          action: 'QUOTE_REQUEST_SUBMITTED',
          resourceType: 'QuoteRequest',
          resourceId: quoteRequest.id,
          purpose: 'QUOTE_REQUEST',
          metadata: {
            clinicId: quoteRequest.clinicId,
            procedureId: quoteRequest.procedureId,
            antiBypassTermsAccepted: dto.antiBypassTermsAccepted,
            hasPatientMessage: Boolean(patientMessage),
          },
        }),
      ),
    );

    return {
      count: created.length,
      quoteRequests: created,
    };
  }

  private getUniqueOfferIds(offerIds: string[]) {
    const uniqueOfferIds = Array.from(new Set(offerIds.map((offerId) => offerId.trim()).filter(Boolean)));

    if (uniqueOfferIds.length === 0) {
      throw new BadRequestException('At least one offer ID is required.');
    }

    if (uniqueOfferIds.length > 4) {
      throw new BadRequestException('Quote requests are limited to four selected offers.');
    }

    return uniqueOfferIds;
  }

  private findVerifiedOffers(offerIds: string[]): Promise<OfferWithRelations[]> {
    return this.prisma.clinicProcedure.findMany({
      where: {
        id: { in: offerIds },
        ...verifiedPublishedOfferWhere,
      },
      include: {
        clinic: true,
        procedure: true,
      },
    });
  }
}
