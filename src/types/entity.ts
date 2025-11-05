import { NotificationType } from 'src/modules/notifications/schemas/notification.schema';
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

export interface AdminHistory {
  action: 'backup' | 'restore' | 'delete';
  timestamp: string;
  filename?: string;
  admin?: string; // nếu muốn track user
}

export interface ListBackupsOptions {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface FindAllForAdminOptions {
  limit?: number;
  page?: number;
  search?: string;
  type?: NotificationType;
  startDate?: string;
  endDate?: string;
}

export interface UserLoginSession {
  userId: string;
  sessionStatus: 'active' | 'revoked' | 'no_session';
  lastActivityType: string | null;
  lastActivityTime: Date | null;
  ip: string | null;
  userAgent: string | null;
  userName: string;
  email: string;
  status: string;
}

export interface SessionFilter {
  sessionStatus?: 'active' | 'revoked';
  keyword?: string; // tìm theo userName hoặc email
  from?: Date;
  to?: Date;
}
