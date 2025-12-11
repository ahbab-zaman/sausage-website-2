// types/product.ts

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  category?: string;
  badge?: string;
  colors?: {
    name: string;
    value: string;
  }[];
  sizes?: string[];
  features?: string[];
  thumb?: string;
  quantity?: number;
  model?: string;
  manufacturer?: string;
  stock_status?: string;
  href?: string;
}

export interface ApiProductResponse {
  product_id: string;
  name: string;
  description: string;
  price: string;
  special?: string;
  image: string;
  thumb?: string;
  rating?: number;
  category_id?: string;
  quantity?: string;
  model?: string;
  manufacturer?: string;
  stock_status?: string;
  href?: string;
}

export interface ProductsApiResponse {
  success: boolean;
  data: ApiProductResponse[];
  error?: string;
}
