// hooks/useProducts.ts

import { useEffect } from "react";
import { useProductStore } from ".././stores/productStore";

export const useProducts = () => {
  const { products, loading, error, fetchProducts } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

export const useFeaturedProducts = () => {
  const { featuredProducts, loading, error, fetchFeaturedProducts } = useProductStore();

  useEffect(() => {
    if (featuredProducts.length === 0) {
      fetchFeaturedProducts();
    }
  }, [featuredProducts.length, fetchFeaturedProducts]);

  return {
    featuredProducts,
    loading,
    error,
    refetch: fetchFeaturedProducts
  };
};
