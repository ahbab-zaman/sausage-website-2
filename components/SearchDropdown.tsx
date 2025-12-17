"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, X, Check } from "lucide-react";
import { authApiClient } from "@/lib/api/authClient";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner"; // or your toast library
import { Spinner } from "./ui/spinner";

interface Product {
  product_id: number;
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
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState<Record<number, boolean>>({});
  const [justAdded, setJustAdded] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get cart actions from Zustand store
  const addItem = useCartStore((state) => state.addItem);

  /* ---------------- Debounced Search with Request Cancellation ---------------- */
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // Cancel any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        const res = await authApiClient.searchProducts(query);

        // Only update if this request wasn't cancelled
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // Access res.data.products instead of res.data
        if (res.success && res.data?.products && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        // Don't show error if request was aborted
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

  /* ---------------- Add to Cart Handler ---------------- */
  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    // Prevent double-click
    if (addingToCart[product.product_id]) {
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.product_id]: true }));

    try {
      // Pass the full product object with the correct structure
      await addItem(
        {
          id: product.product_id.toString(),
          name: product.name,
          price: parseFloat(product.price), // Convert string to number
          image: product.image
          // Add model if it exists in your Product interface
        },
        1
      );

      // Show success feedback
      setJustAdded((prev) => ({ ...prev, [product.product_id]: true }));
      toast.success(`${product.name} added to cart`);

      // Reset success state after 2 seconds
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

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search..."
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-white py-4 pr-10 pl-14 text-base text-gray-800 shadow-sm focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setProducts([]);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg bg-white shadow-xl">
          <div className="border-b px-4 py-3 text-sm font-semibold text-gray-700">
            Search Featured
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center px-4 py-6 text-center text-sm text-gray-500">
              <Spinner className="size-4" />
            </div>
          )}

          {/* Empty */}
          {!loading && products.length === 0 && query && (
            <div className="px-4 py-6 text-center text-sm text-gray-500">No products found</div>
          )}

          {/* Results */}
          <ul className="max-h-96 overflow-y-auto">
            {products.map((product) => {
              const isAdding = addingToCart[product.product_id];
              const wasAdded = justAdded[product.product_id];

              return (
                <li
                  key={product.product_id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
                  <Link
                    href={`/product/${product.product_id}`}
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
                        {product.price}.00 AED {product?.currency}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={isAdding || wasAdded}
                    className={`flex-shrink-0 rounded-full p-2 text-white transition-all duration-200 ${
                      wasAdded
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
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
        </div>
      )}
    </div>
  );
}
