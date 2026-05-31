export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'User';
  avatarUrl: string | null;
}

export interface User extends UserSummary {
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'Admin' | 'User';
  avatarUrl: string | null;
}

export interface UpdateUserRequest {
  fullName: string;
  role: 'Admin' | 'User';
  avatarUrl: string | null;
  isActive: boolean;
}
