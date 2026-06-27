import { ForbiddenException } from '@nestjs/common';
import { RequestUser } from './request-user.interface';
import { UserRole } from './user-role.enum';

const privilegedUserReaders = new Set<UserRole>([
  UserRole.ADMIN,
  UserRole.SUPPORT,
  UserRole.DPO,
]);

export function assertCanAccessUserResource(user: RequestUser, targetUserId: string) {
  if (user.id === targetUserId) {
    return;
  }

  const hasPrivilegedRole = user.roles.some((role) => privilegedUserReaders.has(role));
  if (!hasPrivilegedRole) {
    throw new ForbiddenException('You cannot access this user resource.');
  }
}

