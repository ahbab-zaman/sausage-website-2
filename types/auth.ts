// // --- Backend API Response ---
// export interface ApiResponse<T> {
//   success: number; // 1 = success, 0 = fail
//   error: string[]; // always an array
//   data?: T;
//   message?: string;
// }

// // --- Backend User ---
// export interface BackendUser {
//   customer_id: string;
//   customer_group_id: string;
//   store_id: string;
//   language_id: string;
//   firstname: string;
//   lastname: string;
//   email: string;
//   country_code: string;
//   telephone: string;
//   fax: string;
//   wishlist: string[];
//   newsletter: string;
//   address_id: string;
//   ip: string;
//   status: string;
//   safe: string;
//   code: string;
//   date_added: string;
//   dob: string;
//   device_id: string;
//   device_type: string;
//   notification_status: string;
//   id_proof_front: string;
//   id_proof_back: string;
//   apple_id: string;
//   sms_whatsapp: string;
//   temporary_password: string;
//   otp_status: string;
//   wishlist_total: string;
//   cart_count_products: number;
//   token?: string;
// }

// // --- Client-side User ---
// export interface User {
//   customer_id: string;
//   firstname: string;
//   lastname: string;
//   email: string;
//   telephone?: string;
//   country_code?: string;
//   dob?: string;
//   token?: string;
// }

// // --- Auth Requests ---
// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// export interface LoginResponse {
//   success: boolean;
//   data?: User;
//   error?: string;
//   message?: string;
// }

// export interface RegisterRequest {
//   firstname: string;
//   lastname: string;
//   telephone: string;
//   email: string;
//   password: string;
//   country_code: string;
//   dob: string;
//   id_proof_front?: File;
// }

// export interface RegisterResponse {
//   success: boolean;
//   data?: {
//     customer_id: string;
//     email: string;
//     telephone?: string;
//     otp?: string;
//     message?: string;
//   };
//   error?: string;
//   message?: string;
// }

// export interface VerifyOTPRequest {
//   customer_id: string;
//   otp: string;
// }

// export interface VerifyOTPResponse {
//   success: boolean;
//   data?: {
//     verified: boolean;
//     message?: string;
//   };
//   error?: string;
//   message?: string;
// }

// export interface UpdateAccountRequest {
//   firstname?: string;
//   lastname?: string;
//   email?: string;
//   telephone?: string;
//   country_code?: string;
//   dob?: string;
// }

// export interface TokenResponse {
//   access_token: string;
//   token_type: string;
//   expires_in: number;
//   refresh_token?: string;
// }

// --- Backend API Response (Raw from server) ---
export interface BackendApiResponse<T> {
  success: number; // 1 = success, 0 = fail
  error: string[]; // always an array
  data?: T;
  message?: string;
}

// --- Client API Response (Normalized for use) ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Backend User ---
export interface BackendUser {
  customer_id: string;
  customer_group_id: string;
  store_id: string;
  language_id: string;
  firstname: string;
  lastname: string;
  email: string;
  country_code: string;
  telephone: string;
  fax: string;
  wishlist: string[];
  newsletter: string;
  address_id: string;
  ip: string;
  status: string;
  safe: string;
  code: string;
  date_added: string;
  dob: string;
  device_id: string;
  device_type: string;
  notification_status: string;
  id_proof_front: string;
  id_proof_back: string;
  apple_id: string;
  sms_whatsapp: string;
  temporary_password: string;
  otp_status: string;
  wishlist_total: string;
  cart_count_products: number;
  token?: string;
}

// --- Client-side User ---
export interface User {
  customer_id: string;
  firstname: string;
  lastname: string;
  email: string;
  telephone?: string;
  country_code?: string;
  dob?: string;
  token?: string;
}

// --- Auth Requests ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  customer_id: string;
  email: string;
  firstname: string;
  lastname: string;
  telephone: string;
  country_code: string;
  dob: string;
  token?: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  telephone: string;
  email: string;
  password: string;
  country_code: string;
  dob: string;
  id_proof_front?: File;
}

export interface RegisterResponse {
  customer_id: string;
  email: string;
  telephone?: string;
  otp?: string;
  message?: string;
}

export interface VerifyOTPRequest {
  customer_id: string;
  otp: string;
}

export interface VerifyOTPResponse {
  verified: boolean;
  message?: string;
}

export interface UpdateAccountRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  telephone?: string;
  country_code?: string;
  dob?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// --- Helper function to normalize backend response ---
export function normalizeApiResponse<T>(backendResponse: BackendApiResponse<T>): ApiResponse<T> {
  return {
    success: backendResponse.success === 1,
    data: backendResponse.data,
    error: backendResponse.error?.length > 0 ? backendResponse.error.join(", ") : undefined,
    message: backendResponse.message
  };
}
