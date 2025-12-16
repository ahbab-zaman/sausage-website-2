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

// Existing content...

// Add optional fields for home API product format compatibility
export interface ApiProductResponse {
  id?: number;
  product_id: number;
  name: string;
  // description?: string | undefined;
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
  label?: string; // From home response
  label_image?: string;
  seo_url?: string;
  status?: string;
  special_start_date?: string;
  special_end_date?: string;
  is_wishlist?: number;
  cart_quantity?: number;
}

// New: For home endpoint response
export interface HomeProductResponse extends ApiProductResponse {} // Alias for clarity, same as above

export interface RecommendedSection {
  title: string;
  products: HomeProductResponse[];
}

export interface HomeApiResponse {
  success: number;
  error: string[];
  data: {
    ios_maintenance_mode: string;
    android_maintenance_mode: string;
    maintenance_message: string;
    force_update: number;
    banners: {
      images: Array<{
        link_type: string;
        name: string;
        link: string;
        image: string;
        parent_id: string;
        parent_name: string;
        categories: any[];
      }>;
    };
    popup: Array<{
      link_type: string;
      name: string;
      link: string;
      image: string;
      parent_id: string;
      parent_name: string;
      sub_categories: any[];
    }>;
    recommended: RecommendedSection;
    // ... (other sections like cta1, promotions, etc., can be added if needed)
  };
}
