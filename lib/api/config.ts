// lib/api/config.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.mr-sausages.com";

export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    PRODUCTS: "/index.php?route=feed/rest_api/products",
    FEATURED_PRODUCTS: "/index.php?route=feed/rest_api/products&category=183&filter_max_price=5"
  },
  HEADERS: {
    "Content-Type": "application/json"
    // Add any additional headers your API requires
  }
} as const;
