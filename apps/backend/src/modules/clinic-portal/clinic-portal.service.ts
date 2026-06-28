import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { QuoteRequestStatus, QuoteStatus } from '@prisma/client';

@Injectable()
export class ClinicPortalService {
  constructor(private prisma: PrismaService) {}

  async getClinicIdForUser(userId: string): Promise<string> {
    const member = await this.prisma.clinicMember.findFirst({
      where: { userId },
      select: { clinicId: true },
    });
    if (!member) throw new ForbiddenException('User is not a clinic member');
    return member.clinicId;
  }

  async getRequests(userId: string) {
    const clinicId = await this.getClinicIdForUser(userId);

    const requests = await this.prisma.quoteRequest.findMany({
      where: {
        clinicId,
        status: { not: QuoteRequestStatus.DRAFT },
      },
      include: {
        patient: {
          select: { countryCode: true, languageCode: true, biologicalSex: true },
        },
        procedure: { select: { name: true, specialty: true } },
        quotes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      status: r.status,
      createdAt: r.createdAt,
      procedure: r.procedure.name,
      specialty: r.procedure.specialty,
      patient: {
        countryCode: r.patient?.countryCode ?? 'Unknown',
        languageCode: r.patient?.languageCode ?? 'en',
        sex: r.patient?.biologicalSex ?? 'UNKNOWN',
      },
      hasQuote: r.quotes.length > 0,
      quote: r.quotes[0] ?? null,
    }));
  }

  async getRequest(userId: string, requestId: string) {
    const clinicId = await this.getClinicIdForUser(userId);

    const request = await this.prisma.quoteRequest.findFirst({
      where: { id: requestId, clinicId },
      include: {
        patient: true,
        procedure: true,
        quotes: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!request) throw new NotFoundException('Quote request not found');

    return {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
      procedure: request.procedure,
      patient: {
        countryCode: request.patient?.countryCode,
        languageCode: request.patient?.languageCode,
        sex: request.patient?.biologicalSex,
        allergies: request.patient?.allergies,
        medicalHistory: request.patient?.medicalHistory,
        currentMedication: request.patient?.currentMedication,
      },
      quotes: request.quotes,
      hasQuote: request.quotes.length > 0,
    };
  }

  async sendQuote(
    userId: string,
    requestId: string,
    data: {
      totalPriceCents: number;
      currencyCode: string;
      includedItems: string[];
      excludedItems: string[];
      validityDays: number;
    },
  ) {
    const clinicId = await this.getClinicIdForUser(userId);

    const request = await this.prisma.quoteRequest.findFirst({
      where: { id: requestId, clinicId },
    });
    if (!request) throw new NotFoundException('Quote request not found');

    const validityEndsAt = new Date();
    validityEndsAt.setDate(validityEndsAt.getDate() + data.validityDays);

    const quote = await this.prisma.quote.create({
      data: {
        requestId,
        status: QuoteStatus.SENT,
        totalPriceCents: data.totalPriceCents,
        currencyCode: data.currencyCode,
        includedItems: data.includedItems,
        excludedItems: data.excludedItems,
        validityEndsAt,
      },
    });

    await this.prisma.quoteRequest.update({
      where: { id: requestId },
      data: { status: QuoteRequestStatus.QUOTED },
    });

    return quote;
  }
}
