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

        <div className="mb-8 grid grid-cols-1 justify-center sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button  onClick={() => router.push("/products")} className="bg-[#3A3938] text-white py-2 px-4 rounded-lg flex justify-center items-center cursor-pointer">
            View All Products
            <ArrowRight className="ml-2 h-4 w-4 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
