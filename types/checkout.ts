// types/checkout.ts

export interface ShippingAddress {
  address_id: string;
  name: string;
  address_1: string;
  address_2: string;
  road: string;
  area: string;
  area_id: string;
  landmark: string;
  mobile_country_code: string;
  mobile: string;
  latitude: string;
  longitude: string;
  default: number;
}

export interface ShippingAddressResponse {
  address_id: string;
  addresses: ShippingAddress[];
}

export interface PaymentMethod {
  code: string;
  title: string;
  terms: string;
  sort_order: string;
}

export interface ShippingMethod {
  code: string;
  title: string;
  cost: string;
  tax_class_id: string;
  text: string;
}

export interface PaymentMethodsResponse {
  payment_methods: PaymentMethod[];
  shipping_methods: ShippingMethod[];
  code: string;
  comment: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface TimeSlotResponse {
  now: number;
  time: TimeSlot[];
}

export interface SetPaymentMethodRequest {
  shipping_method: string;
  payment_method: string;
  comment?: string;
  agree: string; // "0" or "1"
}

export interface DeliveryRequest {
  delivery_date: string;
  delivery_time: string;
}

export interface CouponRequest {
  coupon: string;
}

export interface ConfirmOrderRequest {
  device_type?: string;
  device_version?: string;
}

export interface OrderConfirmationResponse {
  order_id: string;
  success: number;
  error: string[];
}
