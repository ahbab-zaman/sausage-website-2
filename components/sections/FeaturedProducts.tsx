// components/FeaturedProducts.tsx

"use client";

import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "../../stores/productStore";

export default function FeaturedProducts() {
  const { featuredProducts, loading, error, fetchFeaturedProducts } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Featured Products</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover our most popular items, carefully selected for their exceptional quality and
              customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Featured Products</h2>
            <p className="mx-auto max-w-2xl text-lg text-red-600">{error}</p>
            <button
              onClick={fetchFeaturedProducts}
              className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Featured Products</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              No featured products available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Featured Products</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover our most popular items, carefully selected for their exceptional quality and
            customer satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
