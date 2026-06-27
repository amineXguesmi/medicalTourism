import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { ListClinicsQuery } from './dto/list-clinics.query';

const verifiedPublishedClinicWhere = {
  verificationStatus: 'VERIFIED',
  publishedAt: { not: null },
} satisfies Prisma.ClinicWhereInput;

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  listVerified(query: ListClinicsQuery) {
    const where: Prisma.ClinicWhereInput = { ...verifiedPublishedClinicWhere };
    const search = query.q?.trim();

    if (query.countryCode) {
      where.countryCode = { equals: query.countryCode, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { countryCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.clinic.findMany({
      where,
      orderBy: [{ countryCode: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { procedures: true },
        },
      },
    });
  }

  findVerifiedById(id: string) {
    return this.prisma.clinic.findFirst({
      where: {
        id,
        ...verifiedPublishedClinicWhere,
      },
      include: {
        procedures: {
          orderBy: { basePriceCents: 'asc' },
          include: { procedure: true },
        },
      },
    });
  }

  listProcedureOffers(clinicId: string) {
    return this.prisma.clinicProcedure.findMany({
      where: {
        clinicId,
        clinic: verifiedPublishedClinicWhere,
      },
      orderBy: { basePriceCents: 'asc' },
      include: {
        procedure: true,
      },
    });
  }
}

