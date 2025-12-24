// components/FeaturedProducts.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useProductStore } from "@/stores/productStore";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FeaturedProducts() {
  const router = useRouter();
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

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
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
              onClick={() => fetchFeaturedProducts()}
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
      <div className="mx-auto w-[90%]">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Featured Products</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover our most popular items, carefully selected for their exceptional quality and
              customer satisfaction.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 justify-center gap-7 sm:grid-cols-2 lg:grid-cols-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push("/products")}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#3A3938] px-5 py-2.5 text-sm font-medium text-white">
            {/* Hover shade layer */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[#4A4948] transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-0" />

            {/* Button content */}
            <span className="relative z-10 flex items-center gap-2">
              View All Products
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
