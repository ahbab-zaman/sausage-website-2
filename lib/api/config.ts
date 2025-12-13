const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://app.mr-sausages.com";

export const API_CONFIG = {
  BASE_URL,
  ENDPOINTS: {
    // Products
    PRODUCTS: "/index.php?route=feed/rest_api/products",
    FEATURED_PRODUCTS: "/index.php?route=feed/rest_api/products",

    // Cart
    CART: "/index.php?route=rest/cart/cart",
    EMPTY_CART: "/index.php?route=rest/cart/emptycart"
  },
  HEADERS: {
    "Content-Type": "application/json"
  }
} as const;
