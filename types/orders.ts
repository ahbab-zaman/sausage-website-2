// types/order.ts

export interface OrderProduct {
  product_id: string;
  manufacturer: string;
  manufacturer_id: number;
  order_product_id: string;
  image: string;
  original_image: string;
  name: string;
  model: string;
  option: any[];
  quantity: string;
  price: string;
  total: string;
  price_raw: number;
  total_raw: number;
  return: string;
  weight: string;
  length: string;
  width: string;
  height: string;
}

export interface OrderTotal {
  order_total_id: string;
  order_id: string;
  code: string;
  title: string;
  value: string;
  sort_order: string;
}

export interface OrderHistory {
  date_added: string;
  status: string;
  comment: string;
}

export interface OrderListItem {
  order_id: string;
  tracking_url: string;
  name: string;
  status: string;
  order_status: string;
  date_added: string;
  products: number;
  total: string;
  total_raw: string;
  review_status: number;
}

export interface OrderDetail {
  delivery_date: string;
  order_id: string;
  tracking_url: string;
  date_added: string;
  customer_id: string;
  firstname: string;
  lastname: string;
  telephone: string;
  email: string;
  order_status_id: string;
  order_status: string;
  payment_address: string;
  payment_method: string;
  shipping_address: string;
  shipping_method: string;
  products: OrderProduct[];
  vouchers: any[];
  totals: OrderTotal[];
  comment: string;
  histories: OrderHistory[];
  timestamp: number;
}

export interface OrderListResponse {
  success: number;
  error: string[];
  data: OrderListItem[];
}

export interface OrderDetailResponse {
  success: number;
  error: string[];
  data: OrderDetail;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
