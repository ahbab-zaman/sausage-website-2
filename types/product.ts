export interface ApiProductResponse {
  id?: number;
  product_id: number;
  name: string;
  description: string;
  price: number | string;
  price_formated?: string;
  special?: string;
  special_formated?: string;
  image?: string;
  thumb?: string;
  images?: string[];
  rating?: number;
  quantity?: number | string;
  model?: string;
  product_code?: string;
  manufacturer?: string;
  stock_status?: string;
  availability?: string;
  attribute_groups?: AttributeGroup[];
  related?: ApiProductResponse[];
}

export interface AttributeGroup {
  attribute_group_id: string;
  name: string;
  attribute: Attribute[];
}

export interface Attribute {
  attribute_id: string;
  name: string;
  icon?: string;
  type?: string;
  text: string;
}

export interface ProductsApiResponse {
  success: number;
  error?: string[];
  data: ApiProductResponse[];
}

// Frontend Product Type
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
  badge?: string;
  quantity?: number;
  model?: string;
  manufacturer?: string;
  stock_status?: string;
  category?: string;
  colors?: Color[];
  sizes?: string[];
  features?: string[];
  // Specifications
  size?: string;
  brand?: string;
  country?: string;
  abv?: string; // Alcohol by Volume or similar metric
  specifications?: ProductSpecification[];
}

export interface ProductSpecification {
  label: string;
  value: string;
  icon?: string;
}

export interface Color {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
}
