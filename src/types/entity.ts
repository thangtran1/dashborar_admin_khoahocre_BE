import { UserRole, UserStatus } from 'src/modules/users/schemas/user.schema';

export interface GoogleUser {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
}

export interface BulkCreateUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  bio?: string;
}
