export interface Address {
  address_id?: string;
  name: string;
  address_1: string;
  address_2: string;
  road: string;
  area: string;
  area_id?: string; // Backend also returns area_id
  landmark?: string;
  mobile: string;
  mobile_country_code: string;
  latitude: string;
  longitude: string;
  default: number | string; // Backend returns number (0 or 1), we send string
}

export interface AddAddressRequest {
  name: string;
  address_1: string;
  address_2: string;
  road: string;
  area: string;
  landmark?: string;
  mobile: string;
  mobile_country_code: string;
  latitude: string;
  longitude: string;
  default: string; // "0" or "1"
}

export interface AddAddressResponse {
  address_id: number;
}

export interface UpdateAddressRequest {
  name: string;
  address_1: string;
  address_2: string;
  road: string;
  area: string;
  landmark?: string;
  mobile: string;
  mobile_country_code: string;
  latitude: string;
  longitude: string;
  default: string; // "0" or "1"
}

export interface GetAddressResponse extends Address {}

export interface DeleteAddressResponse {
  success: number;
  error: string[];
}
