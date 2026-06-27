import { UserRole } from './user-role.enum';

export interface RequestUser {
  id: string;
  roles: UserRole[];
  email?: string;
}
