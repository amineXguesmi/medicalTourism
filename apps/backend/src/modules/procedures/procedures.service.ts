import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';
import { ListProceduresQuery } from './dto/list-procedures.query';

@Injectable()
export class ProceduresService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ListProceduresQuery) {
    const where: Prisma.ProcedureWhereInput = {};
    const search = query.q?.trim();

    if (query.specialty) {
      where.specialty = { equals: query.specialty, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.procedure.findMany({
      where,
      orderBy: [{ specialty: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: {
            clinics: {
              where: {
                clinic: {
                  verificationStatus: 'VERIFIED',
                  publishedAt: { not: null },
                },
              },
            },
          },
        },
      },
    });
  }

  async listSpecialties() {
    const procedures = await this.prisma.procedure.findMany({
      distinct: ['specialty'],
      select: { specialty: true },
      orderBy: { specialty: 'asc' },
    });

    return procedures.map((procedure) => procedure.specialty);
  }

  findBySlug(slug: string) {
    return this.prisma.procedure.findUnique({
      where: { slug },
      include: {
        clinics: {
          where: {
            clinic: {
              verificationStatus: 'VERIFIED',
              publishedAt: { not: null },
            },
          },
          orderBy: { basePriceCents: 'asc' },
          include: {
            clinic: true,
          },
        },
      },
    });
  }
}

