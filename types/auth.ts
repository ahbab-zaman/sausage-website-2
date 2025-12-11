export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone?: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    customer_id: string;
    email: string;
    firstname: string;
    lastname: string;
    telephone: string;
    token?: string;
  };
  error?: string;
  message?: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  telephone: string;
  email: string;
  password: string;
  country_code: string;
  id_proof_front?: File;
  dob: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    customer_id: string;
    email: string;
    telephone?: string;
    otp?: string;
    message?: string;
  };
  error?: string;
  message?: string;
}

export interface VerifyOTPRequest {
  customer_id: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  data?: {
    message: string;
    verified: boolean;
  };
  error?: string;
  message?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
