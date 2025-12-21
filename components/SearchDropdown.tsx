"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, X, Check, Clock } from "lucide-react";
import { authApiClient } from "@/lib/api/authClient";
import { searchApiClient } from "@/lib/api/searchClient";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

interface Product {
  product_id: string;
  name: string;
  price: string;
  currency: string;
  image: string;
}

interface Props {
  baseUrl: string;
}

export default function SearchDropdown({ baseUrl }: Props) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});
  const [showRecent, setShowRecent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addItem = useCartStore((state) => state.addItem);

  /* ---------------- Prefetch Recent Searches on Mount ---------------- */
  useEffect(() => {
    // Prefetch recent searches in the background
    searchApiClient.prefetchRecentSearches();
  }, []);

  /* ---------------- Load Recent Searches on Focus ---------------- */
  const loadRecentSearches = useCallback(async () => {
    if (recentSearches.length > 0) {
      // Already loaded
      setShowRecent(true);
      return;
    }

    setLoadingRecent(true);
    try {
      const keywords = await searchApiClient.getRecentSearches();
      setRecentSearches(keywords);
      setShowRecent(true);
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    } finally {
      setLoadingRecent(false);
    }
  }, [recentSearches.length]);

  /* ---------------- Handle Input Focus ---------------- */
  const handleFocus = useCallback(() => {
    setOpen(true);
    if (!query.trim()) {
      loadRecentSearches();
    }
  }, [query, loadRecentSearches]);

  /* ---------------- Debounced Search with Request Cancellation ---------------- */
  useEffect(() => {
    // Clear recent searches view when typing
    if (query.trim()) {
      setShowRecent(false);
    }

    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        abortControllerRef.current = new AbortController();

        const res = await searchApiClient.searchProducts(query);

        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setProducts(res as any);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Search error", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  /* ---------------- Close on outside click ---------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------------- Handle Recent Search Click ---------------- */
  const handleRecentSearchClick = useCallback((keyword: string) => {
    setQuery(keyword);
    setShowRecent(false);
    inputRef.current?.focus();
  }, []);

  /* ---------------- Add to Cart Handler ---------------- */
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart[product.product_id]) {
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.product_id]: true }));

    try {
      await addItem(
        {
          id: product.product_id.toString(),
          name: product.name,
          price: parseFloat(product.price),
          image: product.image
        },
        1
      );

      setJustAdded((prev) => ({ ...prev, [product.product_id]: true }));
      toast.success(`${product.name} added to cart`);

      setTimeout(() => {
        setJustAdded((prev) => ({ ...prev, [product.product_id]: false }));
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMsg);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.product_id]: false }));
    }
  };

  /* ---------------- Clear Search ---------------- */
  const handleClear = useCallback(() => {
    setQuery("");
    setProducts([]);
    setShowRecent(false);
    loadRecentSearches();
  }, [loadRecentSearches]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onFocus={handleFocus}
          onChange={(e) => setQuery(e.target.value)}
          className={`w-full border-b-[1px] bg-white py-4 pr-10 pl-14 text-base text-gray-800 shadow-sm transition-all duration-300 ease-in-out focus:outline-none ${
            open ? "rounded-tl-lg rounded-tr-lg" : "rounded-lg"
          }`}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 transition-transform hover:scale-110">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown with Animation */}
      <div
        className={`absolute z-50 w-full origin-top overflow-hidden rounded-br-lg rounded-bl-lg bg-white shadow-xl transition-all duration-300 ease-in-out ${
          open
            ? "translate-y-0 scale-y-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-y-95 opacity-0"
        }`}>
        {/* Recent Searches */}
        {showRecent && !query.trim() && (
          <>
            <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold text-gray-700">
              <Clock className="h-4 w-4" />
              Recent Searches
            </div>

            {loadingRecent && (
              <div className="flex items-center justify-center px-4 py-6 text-center text-sm text-gray-500">
                <Spinner className="size-4" />
              </div>
            )}

            {!loadingRecent && recentSearches.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No recent searches</div>
            )}

            {!loadingRecent && recentSearches.length > 0 && (
              <ul className="custom-scrollbar max-h-96 overflow-y-auto">
                {recentSearches.map((keyword, index) => (
                  <li
                    key={`${keyword}-${index}`}
                    style={{ animationDelay: `${index * 30}ms` }}
                    className="animate-fadeInSlide">
                    <button
                      onClick={() => handleRecentSearchClick(keyword)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50">
                      <Clock className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="text-sm text-gray-700">{keyword}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* Search Results */}
        {query.trim() && (
          <>
            <div className="border-b px-4 py-3 text-sm font-semibold text-gray-700">
              Search Products
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center px-4 py-6 text-center text-sm text-gray-500">
                <Spinner className="size-4" />
              </div>
            )}

            {/* Empty */}
            {!loading && products.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No products found</div>
            )}

            {/* Results */}
            {!loading && products.length > 0 && (
              <ul className="custom-scrollbar max-h-96 overflow-y-auto">
                {products.map((product, index) => {
                  const isAdding = addingToCart[product.product_id];
                  const wasAdded = justAdded[product.product_id];

                  return (
                    <li
                      key={product.product_id}
                      style={{ animationDelay: `${index * 30}ms` }}
                      className="animate-fadeInSlide flex items-center justify-between px-4 py-4 transition-colors duration-150 hover:bg-gray-50">
                      <Link
                        href={`/products/${product.product_id}`}
                        className="flex min-w-0 flex-1 items-center gap-4"
                        onClick={() => setOpen(false)}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={60}
                          className="flex-shrink-0 object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-medium text-gray-800">
                            {product.name}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {product.price}.00 {product?.currency}
                          </p>
                        </div>
                      </Link>

                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={isAdding || wasAdded}
                        className={`flex-shrink-0 rounded-full p-2 text-white transition-all duration-200 ${
                          wasAdded
                            ? "scale-110 bg-green-600 hover:bg-green-700"
                            : "bg-red-600 hover:scale-110 hover:bg-red-700 disabled:bg-gray-400"
                        }`}
                        aria-label={`Add ${product.name} to cart`}>
                        {isAdding ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : wasAdded ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <ShoppingCart className="h-4 w-4" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Add keyframe animation and custom scrollbar */}
      <style jsx>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInSlide {
          animation: fadeInSlide 0.3s ease-out forwards;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
          border-radius: 10px;
          border: 2px solid #f1f1f1;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #f1f1f1;
        }
      `}</style>
    </div>
  );
}
