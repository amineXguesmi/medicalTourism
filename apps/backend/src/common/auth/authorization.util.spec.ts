import { ForbiddenException } from '@nestjs/common';
import { assertCanAccessUserResource } from './authorization.util';
import { RequestUser } from './request-user.interface';
import { UserRole } from './user-role.enum';

describe('assertCanAccessUserResource', () => {
  it('allows a user to access their own resource', () => {
    const user: RequestUser = {
      id: 'patient-1',
      roles: [UserRole.PATIENT],
      email: 'patient@example.com',
    };

    expect(() => assertCanAccessUserResource(user, 'patient-1')).not.toThrow();
  });

  it.each([UserRole.ADMIN, UserRole.SUPPORT, UserRole.DPO])(
    'allows %s to access another user resource',
    (role) => {
      const user: RequestUser = {
        id: 'staff-1',
        roles: [role],
        email: 'staff@example.com',
      };

      expect(() => assertCanAccessUserResource(user, 'patient-1')).not.toThrow();
    },
  );

  it('blocks a regular patient from accessing another user resource', () => {
    const user: RequestUser = {
      id: 'patient-1',
      roles: [UserRole.PATIENT],
      email: 'patient@example.com',
    };

    expect(() => assertCanAccessUserResource(user, 'patient-2')).toThrow(ForbiddenException);
  });
});

