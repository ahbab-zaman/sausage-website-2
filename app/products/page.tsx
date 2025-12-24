"use client";
import { useEffect, useState, useMemo, useCallback, useTransition } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/productStore";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
export default function ProductsPage() {
  const { products, loading, error, fetchProducts, prefetchProducts } = useProductStore();
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);
  const itemsPerLoad = 12;
  const [openCategory, setOpenCategory] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);

  // Prefetch products on mount
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);
  // Fetch products on mount
  useEffect(() => {
    fetchProducts("all");
  }, [fetchProducts]);
  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products
      .filter((product) => {
        // Price filter
        const price = product.price;
        switch (priceRange) {
          case "under-50":
            return price < 50;
          case "50-100":
            return price >= 50 && price <= 100;
          case "100-200":
            return price >= 100 && price <= 200;
          case "over-200":
            return price > 200;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        // Sorting
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0; // featured (default)
        }
      });
  }, [products, priceRange, sortBy]);
  const displayedProducts = useMemo(
    () => filteredProducts.slice(0, displayCount),
    [filteredProducts, displayCount]
  );
  const hasMore = displayCount < filteredProducts.length;
  const totalProducts = filteredProducts.length;
  const handleLoadMore = useCallback(() => {
    startTransition(() => {
      setDisplayCount((prev) => Math.min(prev + itemsPerLoad, filteredProducts.length));
    });
  }, [filteredProducts.length]);
  const handleCategoryChange = useCallback(
    (category: string) => {
      startTransition(() => {
        setSelectedCategory(category);
        fetchProducts(category);
        setDisplayCount(12);
      });
    },
    [fetchProducts]
  );
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
  const getCategoryLabel = useCallback((category: string) => {
    switch (category) {
      case "halal":
        return "Halal Products";
      case "non-halal":
        return "Non-Halal Products";
      default:
        return "All Products";
    }
  }, []);
  if (loading && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <Spinner className="size-8" />
        <p className="mt-4 text-gray-500">Loading products...</p>
      </div>
    );
  }
  if (error && products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchProducts(selectedCategory, true)} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }
  return (
    <>
      <div>
        {/* Breadcrumb */}
        <div className="mb-6 flex w-full items-center bg-gray-200 text-sm text-gray-600">
          <div className="mx-auto w-[90%] py-[6px]">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">All Products</span>
          </div>
        </div>

        <div className="lg:px-16 py-2">
          <div className="flex flex-col gap-8 pt-2 lg:flex-row">
            {/* Filters Sidebar */}
            <div className="lg:w-64">
              <div className="mb-4 lg:hidden lg:px-0 px-2">
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
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setOpenCategory(!openCategory)}
                    className="flex w-full items-center justify-between text-sm font-semibold tracking-widest text-gray-900 uppercase">
                    Product Type
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        openCategory ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openCategory
                        ? "mt-4 grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="space-y-3 overflow-hidden">
                      {[
                        { value: "all", label: "All Products" },
                        { value: "halal", label: "Halal" },
                        { value: "non-halal", label: "Non-Halal" }
                      ].map((category) => (
                        <label
                          key={category.value}
                          className="group flex cursor-pointer items-center gap-3">
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={selectedCategory === category.value}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="h-4 w-4 accent-red-600"
                          />
                          <span className="text-sm text-gray-700 transition group-hover:text-gray-900">
                            {category.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price Filter */}
                <div className="">
                  <button
                    onClick={() => setOpenPrice(!openPrice)}
                    className="flex w-full items-center justify-between text-sm font-semibold tracking-widest text-gray-900 uppercase">
                    Price Range
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        openPrice ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      openPrice ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}>
                    <div className="space-y-3 overflow-hidden">
                      {[
                        { value: "all", label: "All Prices" },
                        { value: "under-50", label: "Under $50" },
                        { value: "50-100", label: "$50 - $100" },
                        { value: "100-200", label: "$100 - $200" },
                        { value: "over-200", label: "Over $200" }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="group flex cursor-pointer items-center gap-3">
                          <input
                            type="radio"
                            name="price"
                            value={option.value}
                            checked={priceRange === option.value}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            className="h-4 w-4 accent-red-600"
                          />
                          <span className="text-sm text-gray-700 transition group-hover:text-gray-900">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory !== "all" || priceRange !== "all") && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-semibold tracking-widest text-gray-900 uppercase">
                        Active Filters
                      </h3>
                      <button
                        onClick={() => {
                          handleCategoryChange("all");
                          handlePriceChange("all");
                        }}
                        className="text-xs font-medium text-red-600 hover:text-red-700">
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1">
                      {selectedCategory !== "all" && (
                        <div className="text-xs text-gray-600">
                          • {getCategoryLabel(selectedCategory)}
                        </div>
                      )}
                      {priceRange !== "all" && (
                        <div className="text-xs text-gray-600">
                          •{" "}
                          {
                            [
                              { value: "under-50", label: "Under $50" },
                              { value: "50-100", label: "$50 - $100" },
                              { value: "100-200", label: "$100 - $200" },
                              { value: "over-200", label: "Over $200" }
                            ].find((o) => o.value === priceRange)?.label
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between px-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Products ({totalProducts})
                  {isPending && <span className="ml-2 text-sm text-gray-400">(updating...)</span>}
                </h1>
                {/* Sort Dropdown */}
                <div className="relative">
                  {/* Trigger */}
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400 hover:shadow-md focus:outline-none">
                    <span className="text-gray-600">Sort by</span>
                    <span className="font-semibold">{getSortLabel()}</span>

                    <ChevronDown
                      className={`ml-1 h-4 w-4 text-gray-400 transition-transform duration-300 ${
                        showSortDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Overlay */}
                  {showSortDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortDropdown(false)}
                      />

                      {/* Dropdown */}
                      <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl duration-200">
                        {[
                          { value: "featured", label: "Featured" },
                          { value: "name-asc", label: "Name (A – Z)" },
                          { value: "name-desc", label: "Name (Z – A)" },
                          { value: "price-low", label: "Price (Low → High)" },
                          { value: "price-high", label: "Price (High → Low)" },
                          { value: "rating", label: "Highest Rated" }
                        ].map((sort) => {
                          const isActive = sortBy === sort.value;

                          return (
                            <button
                              key={sort.value}
                              onClick={() => handleSortChange(sort.value)}
                              className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-all ${
                                isActive
                                  ? "bg-[#AA383A]/10 font-semibold text-[#AA383A]"
                                  : "text-gray-800 hover:bg-gray-50"
                              }`}>
                              {sort.label}

                              {isActive && <span className="h-2 w-2 rounded-full bg-[#AA383A]" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Products Grid */}
              {displayedProducts.length > 0 ? (
                <>
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 p-3">
                    {displayedProducts.map((product) => (
                      <div className="w-full">
                        <ProductCard key={product.id} product={product} />
                      </div>
                    ))}
                  </div>
                  {hasMore && (
                    <div className="mt-12 flex flex-col items-center space-y-6">
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
                      <button
                        onClick={handleLoadMore}
                        disabled={isPending}
                        className="rounded-lg bg-gray-800 px-16 py-4 text-base font-bold tracking-wide text-white uppercase transition-colors duration-200 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50">
                        {isPending ? <Spinner className="size-6" /> : "LOAD MORE"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto max-w-md">
                    <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">No products found</h3>
                    <p className="mb-6 text-gray-500">
                      No products match your current filters. Try adjusting your selection.
                    </p>
                    <Button
                      onClick={() => {
                        handleCategoryChange("all");
                        handlePriceChange("all");
                      }}
                      variant="outline">
                      Clear All Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
