import { BadRequestException, Injectable } from '@nestjs/common';
import { Clinic, ClinicProcedure, Prisma, Procedure } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { CostEstimationService } from '../cost-estimation/cost-estimation.service';
import { SearchOffersQuery } from './dto/search-offers.query';

type ClinicOffer = ClinicProcedure & {
  clinic: Clinic;
  procedure: Procedure;
};

const verifiedPublishedOfferWhere = {
  clinic: {
    verificationStatus: 'VERIFIED',
    publishedAt: { not: null },
  },
} satisfies Prisma.ClinicProcedureWhereInput;

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costEstimation: CostEstimationService,
  ) {}

  async searchOffers(query: SearchOffersQuery) {
    const where = this.buildOfferWhere(query);
    const offers = await this.prisma.clinicProcedure.findMany({
      where,
      take: query.limit ?? 20,
      orderBy: this.resolvePrismaOrder(query.sort),
      include: {
        clinic: true,
        procedure: true,
      },
    });
    const mapped = offers.map((offer) => this.mapOffer(offer, query.patientCountryCode));

    if (query.sort === 'total_asc') {
      mapped.sort((a, b) => this.nullLast(a.estimate.estimatedTotalCents, b.estimate.estimatedTotalCents));
    }

    return {
      filters: {
        procedureSlug: query.procedureSlug,
        countryCode: query.countryCode,
        patientCountryCode: query.patientCountryCode,
        q: query.q,
        minPriceCents: query.minPriceCents,
        maxPriceCents: query.maxPriceCents,
        sort: query.sort ?? 'price_asc',
      },
      count: mapped.length,
      offers: mapped,
    };
  }

  async compareOffers(offerIdsValue: string) {
    const offerIds = offerIdsValue
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (offerIds.length === 0) {
      throw new BadRequestException('At least one offer ID is required.');
    }

    if (offerIds.length > 4) {
      throw new BadRequestException('Comparison is limited to four offers.');
    }

    const offers = await this.prisma.clinicProcedure.findMany({
      where: {
        id: { in: offerIds },
        ...verifiedPublishedOfferWhere,
      },
      include: {
        clinic: true,
        procedure: true,
      },
    });
    const mapped = offers.map((offer) => this.mapOffer(offer));

    return {
      requestedOfferIds: offerIds,
      count: mapped.length,
      offers: mapped.sort((a, b) => offerIds.indexOf(a.id) - offerIds.indexOf(b.id)),
    };
  }

  private buildOfferWhere(query: SearchOffersQuery): Prisma.ClinicProcedureWhereInput {
    const where: Prisma.ClinicProcedureWhereInput = { ...verifiedPublishedOfferWhere };
    const search = query.q?.trim();

    if (query.procedureSlug) {
      where.procedure = {
        slug: query.procedureSlug,
      };
    }

    if (query.countryCode) {
      where.clinic = {
        ...(where.clinic as Prisma.ClinicWhereInput),
        countryCode: { equals: query.countryCode, mode: 'insensitive' },
      };
    }

    if (query.minPriceCents !== undefined || query.maxPriceCents !== undefined) {
      where.basePriceCents = {
        ...(query.minPriceCents !== undefined ? { gte: query.minPriceCents } : {}),
        ...(query.maxPriceCents !== undefined ? { lte: query.maxPriceCents } : {}),
      };
    }

    if (search) {
      where.OR = [
        { clinic: { name: { contains: search, mode: 'insensitive' } } },
        { clinic: { countryCode: { contains: search, mode: 'insensitive' } } },
        { procedure: { name: { contains: search, mode: 'insensitive' } } },
        { procedure: { specialty: { contains: search, mode: 'insensitive' } } },
        { procedure: { description: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private resolvePrismaOrder(sort: SearchOffersQuery['sort']): Prisma.ClinicProcedureOrderByWithRelationInput[] {
    switch (sort) {
      case 'price_desc':
        return [{ basePriceCents: 'desc' }, { clinic: { name: 'asc' } }];
      case 'clinic_name':
        return [{ clinic: { name: 'asc' } }, { basePriceCents: 'asc' }];
      case 'total_asc':
      case 'price_asc':
      default:
        return [{ basePriceCents: 'asc' }, { clinic: { name: 'asc' } }];
    }
  }

  private mapOffer(offer: ClinicOffer, patientCountryCode?: string) {
    const estimate = this.costEstimation.estimateTotalCost({
      procedurePriceCents: offer.basePriceCents,
      clinicCountryCode: offer.clinic.countryCode,
      patientCountryCode,
    });

    return {
      id: offer.id,
      clinic: {
        id: offer.clinic.id,
        name: offer.clinic.name,
        countryCode: offer.clinic.countryCode,
        verificationStatus: offer.clinic.verificationStatus,
        publishedAt: offer.clinic.publishedAt,
      },
      procedure: {
        id: offer.procedure.id,
        slug: offer.procedure.slug,
        name: offer.procedure.name,
        specialty: offer.procedure.specialty,
        description: offer.procedure.description,
        requiredDocs: offer.procedure.requiredDocs,
      },
      price: {
        basePriceCents: offer.basePriceCents,
        currencyCode: offer.currencyCode,
        includedItems: offer.includedItems,
        excludedItems: offer.excludedItems,
      },
      availability: offer.availability,
      estimate,
    };
  }

  private nullLast(left: number | null, right: number | null) {
    if (left === null && right === null) {
      return 0;
    }

    if (left === null) {
      return 1;
    }

    if (right === null) {
      return -1;
    }

    return left - right;
  }
}

