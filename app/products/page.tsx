"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Filter, ChevronUp } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Load More pagination state
  const [displayCount, setDisplayCount] = useState(12);
  const itemsPerLoad = 12;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Filtered and sorted products
  const filteredProducts = products
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

  // Products to display
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;
  const totalProducts = filteredProducts.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + itemsPerLoad);
  };

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(12);
  }, [selectedCategory, priceRange, sortBy]);

  const getSortLabel = () => {
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
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
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
                      onChange={(e) => setSelectedCategory(e.target.value)}
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
                      onChange={(e) => setPriceRange(e.target.value)}
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
            <h1 className="text-2xl font-bold text-gray-900">Products ({totalProducts})</h1>

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
                  <button
                    onClick={() => {
                      setSortBy("name-asc");
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                      sortBy === "name-asc"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-900"
                    }`}>
                    Name (A - Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("name-desc");
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                      sortBy === "name-desc"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-900"
                    }`}>
                    Name (Z - A)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("price-low");
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                      sortBy === "price-low"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-900"
                    }`}>
                    Price (Low &gt; High)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("price-high");
                      setShowSortDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 ${
                      sortBy === "price-high"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-900"
                    }`}>
                    Price (High &gt; Low)
                  </button>
                </div>
              )}
            </div>
          </div>

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
                className="rounded-lg bg-gray-800 px-16 py-4 text-base font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-gray-900">
                LOAD MORE
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
