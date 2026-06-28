import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma, User, UserRole as PrismaUserRole } from '@prisma/client';
import { UserRole } from '../../common/auth/user-role.enum';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeUser } from '../../common/security/sanitize-user';
import { AuditService } from '../audit/audit.service';

export interface PatientProfileInput {
  fullName?: string;
  countryCode?: string;
  residenceCity?: string;
  languageCode?: string;
  currencyCode?: string;
  dateOfBirth?: string | Date;
  biologicalSex?: string;
  genderIdentity?: string;
  latitude?: number;
  longitude?: number;
  travelRadiusKm?: number;
  preferredDestinationCountryCode?: string;
  medicalSummary?: string;
}

export interface CreateUserInput {
  email?: string;
  phone?: string;
  passwordHash?: string;
  roles: UserRole[];
  mfaEnabled?: boolean;
  patientProfile?: PatientProfileInput;
}

export interface UpdateCurrentUserInput extends PatientProfileInput {
  phone?: string;
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

    const patientProfileData = input.patientProfile
      ? this.buildPatientProfileData(input.patientProfile)
      : null;

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash: input.passwordHash,
        roles: input.roles as PrismaUserRole[],
        mfaEnabled: input.mfaEnabled ?? false,
        ...(patientProfileData
          ? {
              patientProfile: {
                create: patientProfileData as Prisma.PatientProfileCreateWithoutUserInput,
              },
            }
          : {}),
      },
      include: {
        patientProfile: true,
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { patientProfile: true },
    });
    return user ? (sanitizeUser(user) as Omit<User, 'passwordHash'>) : null;
  }

  async findPrivateByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { patientProfile: true },
    });
  }

  async updateCurrentUser(userId: string, input: UpdateCurrentUserInput) {
    const phone = cleanString(input.phone);

    if (phone) {
      const existing = await this.prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: userId },
        },
      });

      if (existing) {
        throw new ConflictException('A user with this phone already exists.');
      }
    }

    const patientProfileData = this.buildPatientProfileData(input);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(phone ? { phone } : {}),
        ...(patientProfileData
          ? {
              patientProfile: {
                upsert: {
                  create: patientProfileData as Prisma.PatientProfileCreateWithoutUserInput,
                  update: patientProfileData as Prisma.PatientProfileUpdateInput,
                },
              },
            }
          : {}),
      },
      include: { patientProfile: true },
    });

    await this.audit.record({
      actorUserId: userId,
      action: 'PATIENT_PROFILE_UPDATED',
      resourceType: 'User',
      resourceId: userId,
      purpose: 'PROFILE_MANAGEMENT',
    });

    return sanitizeUser(user) as Omit<User, 'passwordHash'>;
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

  private buildPatientProfileData(input: PatientProfileInput) {
    const fullName = cleanString(input.fullName);
    const countryCode = cleanCode(input.countryCode);
    const residenceCity = cleanString(input.residenceCity);
    const languageCode = cleanString(input.languageCode);
    const currencyCode = cleanCode(input.currencyCode);
    const genderIdentity = cleanString(input.genderIdentity);
    const medicalSummary = cleanString(input.medicalSummary);
    const preferredDestinationCountryCode = cleanCode(
      input.preferredDestinationCountryCode,
    );
    const data: Record<string, unknown> = {};

    if (fullName) {
      data.fullName = fullName;
    }
    if (countryCode) {
      data.countryCode = countryCode;
    }
    if (residenceCity) {
      data.residenceCity = residenceCity;
    }
    if (languageCode) {
      data.languageCode = languageCode;
    }
    if (currencyCode) {
      data.currencyCode = currencyCode;
    }
    if (input.dateOfBirth) {
      data.dateOfBirth =
        input.dateOfBirth instanceof Date
          ? input.dateOfBirth
          : new Date(input.dateOfBirth);
    }
    if (input.biologicalSex) {
      data.biologicalSex = input.biologicalSex;
    }
    if (genderIdentity) {
      data.genderIdentity = genderIdentity;
    }
    if (input.latitude !== undefined) {
      data.latitude = input.latitude;
    }
    if (input.longitude !== undefined) {
      data.longitude = input.longitude;
    }
    if (input.travelRadiusKm !== undefined) {
      data.travelRadiusKm = input.travelRadiusKm;
    }
    if (preferredDestinationCountryCode || input.travelRadiusKm !== undefined) {
      data.travelPreferences = {
        ...(preferredDestinationCountryCode
          ? { preferredDestinationCountryCode }
          : {}),
        ...(input.travelRadiusKm !== undefined
          ? { travelRadiusKm: input.travelRadiusKm }
          : {}),
      };
    }
    if (medicalSummary) {
      data.medicalHistory = {
        summary: medicalSummary,
      };
    }

    return Object.keys(data).length > 0 ? data : null;
  }
}

function cleanString(value?: string) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
}

function cleanCode(value?: string) {
  return cleanString(value)?.toUpperCase();
}
