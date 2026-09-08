import { USERS } from "@/utils";

export type UserRole = (typeof USERS)[keyof typeof USERS];
export type UserKey = keyof typeof USERS;

export interface User {
  role: UserRole;
}

export interface Roles {
  roleId: string;
  startDate: string;
  endDate?: string | null;
}

export interface AdminUserData {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  roles: Roles[];
  status: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UsersListResponse {
  content: AdminUserData[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
