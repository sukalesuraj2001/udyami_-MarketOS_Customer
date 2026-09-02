export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
  testMode?: boolean;
}