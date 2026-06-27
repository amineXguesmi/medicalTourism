import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/database/prisma.service';

export interface RecordAuditLogInput {
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  purpose?: string;
  reason?: string;
  ipHash?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        purpose: input.purpose,
        reason: input.reason,
        ipHash: input.ipHash,
        metadata: input.metadata as Prisma.InputJsonValue,
      },
    });
  }
}
