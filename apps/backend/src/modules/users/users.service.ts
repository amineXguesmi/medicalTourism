import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { User, UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '../../common/auth/user-role.enum';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeUser } from '../../common/security/sanitize-user';
import { AuditService } from '../audit/audit.service';

export interface CreateUserInput {
  email?: string;
  phone?: string;
  passwordHash?: string;
  roles: UserRole[];
  mfaEnabled?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(input: CreateUserInput, actorUserId?: string) {
    if (!input.email && !input.phone) {
      throw new BadRequestException('A user must have an email or phone number.');
    }

    const existing = await this.findByEmailOrPhone(input.email, input.phone);
    if (existing) {
      throw new ConflictException('A user with this email or phone already exists.');
    }

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        roles: input.roles as PrismaUserRole[],
        mfaEnabled: input.mfaEnabled ?? false,
      },
    });

    await this.audit.record({
      actorUserId,
      action: 'USER_CREATED',
      resourceType: 'User',
      resourceId: user.id,
      purpose: 'ACCOUNT_MANAGEMENT',
      metadata: { roles: user.roles },
    });

    return sanitizeUser(user) as Omit<User, 'passwordHash'>;
  }

  async findPublicById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? (sanitizeUser(user) as Omit<User, 'passwordHash'>) : null;
  }

  async findPrivateByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  private async findByEmailOrPhone(email?: string, phone?: string) {
    if (!email && !phone) {
      return null;
    }

    return this.prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
  }
}
