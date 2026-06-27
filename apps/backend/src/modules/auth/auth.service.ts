import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../../common/auth/user-role.enum';
import { sanitizeUser } from '../../common/security/sanitize-user';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  async registerPatient(dto: RegisterPatientDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      roles: [UserRole.PATIENT],
    });

    await this.audit.record({
      actorUserId: user.id,
      action: 'PATIENT_REGISTERED',
      resourceType: 'User',
      resourceId: user.id,
      purpose: 'ACCOUNT_REGISTRATION',
    });

    return this.issueAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findPrivateByEmail(dto.email);
    if (!user?.passwordHash) {
      await this.auditFailedLogin(dto.email);
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      await this.auditFailedLogin(dto.email);
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.audit.record({
      actorUserId: user.id,
      action: 'USER_LOGGED_IN',
      resourceType: 'User',
      resourceId: user.id,
      purpose: 'AUTHENTICATION',
    });

    return this.issueAuthResponse(sanitizeUser(user));
  }

  private issueAuthResponse(user: { id: string; email?: string | null; roles: string[] }) {
    return {
      user,
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        roles: user.roles,
      }),
    };
  }

  private async auditFailedLogin(email: string) {
    await this.audit.record({
      action: 'USER_LOGIN_FAILED',
      resourceType: 'User',
      purpose: 'AUTHENTICATION',
      metadata: { email },
    });
  }
}
