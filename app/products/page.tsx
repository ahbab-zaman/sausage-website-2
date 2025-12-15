"use client";

import { useEffect, useState, useMemo, useCallback, useTransition } from "react";
import { ChevronDown, Filter, ChevronUp } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/productStore";
import { Product } from "@/types/product";
import { Spinner } from "@/components/ui/spinner";

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, prefetchProducts } = useProductStore();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Load More pagination state
  const [displayCount, setDisplayCount] = useState(12);
  const itemsPerLoad = 12;

  // Prefetch on mount
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Memoize filtered and sorted products to avoid recalculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => selectedCategory === "all" || product.category === selectedCategory)
      .filter((product) => {
        if (priceRange === "all") return true;
        if (priceRange === "under-50") return product.price < 50;
        if (priceRange === "50-100") return product.price >= 50 && product.price <= 100;
        if (priceRange === "100-200") return product.price >= 100 && product.price <= 200;
        if (priceRange === "over-200") return product.price > 200;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [products, selectedCategory, priceRange, sortBy]);

  // Memoize displayed products
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const hasMore = displayCount < filteredProducts.length;
  const totalProducts = filteredProducts.length;

  // Use transition for smooth updates
  const handleLoadMore = useCallback(() => {
    startTransition(() => {
      setDisplayCount((prev) => prev + itemsPerLoad);
    });
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    startTransition(() => {
      setSelectedCategory(category);
      setDisplayCount(12);
    });
  }, []);

  const handlePriceChange = useCallback((price: string) => {
    startTransition(() => {
      setPriceRange(price);
      setDisplayCount(12);
    });
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    startTransition(() => {
      setSortBy(sort);
      setShowSortDropdown(false);
      setDisplayCount(12);
    });
  }, []);

  const getSortLabel = useCallback(() => {
    switch (sortBy) {
      case "name-asc":
        return "Name (A - Z)";
      case "name-desc":
        return "Name (Z - A)";
      case "price-low":
        return "Price (Low > High)";
      case "price-high":
        return "Price (High > Low)";
      case "rating":
        return "Highest Rated";
      default:
        return "Featured";
    }
  }, [sortBy]);

  if (loading && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-gray-500">
          <Spinner className="size-6" />
        </p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchProducts(true)} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm text-gray-600">
        <a href="/" className="hover:text-gray-900">
          Home
        </a>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Beer & Cider</span>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <div className="lg:w-64">
          <div className="mb-4 lg:hidden">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            {/* Category Filter */}
            <div>
              <h3 className="mb-3 text-xs tracking-widest uppercase">Category</h3>
              <div className="space-y-2">
                {["all", "audio", "wearables", "accessories"].map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="capitalize">
                      {category === "all" ? "All Products" : category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="mb-3 text-xs tracking-widest uppercase">Price Range</h3>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All Prices" },
                  { value: "under-50", label: "Under $50" },
                  { value: "50-100", label: "$50 - $100" },
                  { value: "100-200", label: "$100 - $200" },
                  { value: "over-200", label: "Over $200" }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="price"
                      value={option.value}
                      checked={priceRange === option.value}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="mr-2"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Products ({totalProducts})
              {isPending && <span className="ml-2 text-sm text-gray-400">(updating...)</span>}
            </h1>

            {/* Custom Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:border-gray-400 focus:border-gray-400 focus:outline-none">
                <span className="font-medium">Sort By</span>
                <span className="text-gray-700">{getSortLabel()}</span>
                {showSortDropdown ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>

              {showSortDropdown && (
                <div className="absolute top-full right-0 z-50 mt-1 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  {["name-asc", "name-desc", "price-low", "price-high"].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => handleSortChange(sort)}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                        sortBy === sort ? "bg-red-600 text-white hover:bg-red-700" : "text-gray-900"
                      }`}>
                      {sort === "name-asc" && "Name (A - Z)"}
                      {sort === "name-desc" && "Name (Z - A)"}
                      {sort === "price-low" && "Price (Low > High)"}
                      {sort === "price-high" && "Price (High > Low)"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid with optimized rendering */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Pagination */}
          {hasMore && (
            <div className="mt-12 flex flex-col items-center space-y-6">
              {/* Progress Indicator */}
              <div className="w-full max-w-md text-center">
                <p className="mb-4 text-base text-gray-700">
                  You've viewed {displayedProducts.length} of {totalProducts} products
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-red-500 transition-all duration-300"
                    style={{
                      width: `${(displayedProducts.length / totalProducts) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Load More Button */}
              <button
                onClick={handleLoadMore}
                disabled={isPending}
                className="rounded-lg bg-gray-800 px-16 py-4 text-base font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-gray-900 disabled:opacity-50">
                {isPending ? <Spinner className="size-6" /> : "LOAD MORE"}
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
