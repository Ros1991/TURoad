export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  enabled: boolean;
  emailVerified: boolean;
  profilePictureUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
