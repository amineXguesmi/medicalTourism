import { Injectable, NotFoundException } from '@nestjs/common';
import { ConsentPurpose as PrismaConsentPurpose, Prisma } from '@prisma/client';
import { assertCanAccessUserResource } from '../../common/auth/authorization.util';
import { RequestUser } from '../../common/auth/request-user.interface';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GrantConsentDto } from './dto/grant-consent.dto';

@Injectable()
export class ConsentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  findForUser(userId: string) {
    return this.prisma.consent.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async grant(userId: string, dto: GrantConsentDto, actorUserId?: string) {
    const consent = await this.prisma.consent.create({
      data: {
        userId,
        purpose: dto.purpose as PrismaConsentPurpose,
        metadata: dto.metadata as Prisma.InputJsonValue,
      },
    });

    await this.audit.record({
      actorUserId: actorUserId ?? userId,
      action: 'CONSENT_GRANTED',
      resourceType: 'Consent',
      resourceId: consent.id,
      purpose: dto.purpose,
      metadata: { userId },
    });

    return consent;
  }

  async revoke(consentId: string, reason?: string, actor?: RequestUser) {
    const existing = await this.prisma.consent.findUnique({ where: { id: consentId } });
    if (!existing) {
      throw new NotFoundException('Consent not found.');
    }

    if (actor) {
      assertCanAccessUserResource(actor, existing.userId);
    }

    const consent = await this.prisma.consent.update({
      where: { id: consentId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await this.audit.record({
      actorUserId: actor?.id ?? existing.userId,
      action: 'CONSENT_REVOKED',
      resourceType: 'Consent',
      resourceId: consent.id,
      purpose: consent.purpose,
      reason,
      metadata: { userId: consent.userId },
    });

    return consent;
  }
}
