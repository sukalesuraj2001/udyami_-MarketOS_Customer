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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  mobileNumber: string;
  homeLocation: string;
  businessLocation: string;
  latitude: number;
  longitude: number;
  hasBusiness: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  [key: string]: unknown;
}
