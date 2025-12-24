"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useAuthStore } from "@/stores/authStore";
import ProductCard from "@/components/ProductCard";

export default function RecommendedSection() {
  const { recommended, fetchRecommended, loading } = useProductStore();
  const { isAuthenticated } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchRecommended();
    }
  }, [fetchRecommended, isAuthenticated]);

  // Update visible count on resize
  useEffect(() => {
    const updateVisibleCount = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth >= 1280) setVisibleCount(5);
      else if (window.innerWidth >= 1024) setVisibleCount(4);
      else if (window.innerWidth >= 768) setVisibleCount(3);
      else if (window.innerWidth >= 640) setVisibleCount(2);
      else setVisibleCount(1);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  // Reset index when data changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [recommended]);

  if (!isAuthenticated()) return null;

  const maxIndex = Math.max(0, recommended.length - visibleCount);

  const next = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Recommended Products
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Discover our most recommended items, carefully selected for their exceptional quality
              and customer satisfaction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (recommended.length === 0) return null;

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title & Description */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Recommended Products
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover our most recommended items, carefully selected for their exceptional quality
            and customer satisfaction.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className={`absolute top-1/2 left-0 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all ${
              currentIndex === 0
                ? "cursor-not-allowed opacity-40"
                : "opacity-70 hover:scale-110 hover:opacity-100"
            }`}
            aria-label="Previous">
            <ChevronLeft className="h-7 w-7 text-gray-800" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className={`absolute top-1/2 right-0 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg transition-all ${
              currentIndex >= maxIndex
                ? "cursor-not-allowed opacity-40"
                : "opacity-70 hover:scale-110 hover:opacity-100"
            }`}
            aria-label="Next">
            <ChevronRight className="h-7 w-7 text-gray-800" />
          </button>

          {/* Track */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-700 ease-in-out py-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
              }}>
              {recommended.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / visibleCount}% - ${recommended.length > visibleCount ? "24px" : "0px"})`
                  }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
