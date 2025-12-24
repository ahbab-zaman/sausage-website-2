"use client";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Star,
  Heart,
  Minus,
  Plus,
  Share,
  Loader2,
  CheckCircle2,
  Wine,
  Ruler,
  Building2,
  Globe
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/stores/authStore";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import ReviewsSection from "@/components/Review";
import { toast } from "sonner";

type Props = { product: Product; relatedProducts: Product[] };

// Memoized components (unchanged)
const ProductImage = memo(
  ({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) => (
    <Image
      fill
      src={src || "/placeholder.svg"}
      alt={alt}
      className="object-contain p-8"
      priority={priority}
      sizes="(max-width: 768px) 100vw, 500px"
    />
  )
);
ProductImage.displayName = "ProductImage";

const ProductThumbnail = memo(
  ({
    image,
    alt,
    index,
    isSelected,
    onClick
  }: {
    image: string;
    alt: string;
    index: number;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-all ${
        isSelected
          ? "border-red-600 ring-2 ring-red-600 ring-offset-2"
          : "border-gray-300 hover:border-gray-400"
      }`}>
      <Image
        width={100}
        height={100}
        src={image || "/placeholder.svg"}
        alt={`${alt} ${index + 1}`}
        className="h-full w-full object-contain p-2"
      />
    </button>
  )
);
ProductThumbnail.displayName = "ProductThumbnail";

const getSpecIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("abv") || lowerLabel.includes("alcohol")) return Wine;
  if (lowerLabel.includes("size")) return Ruler;
  if (lowerLabel.includes("brand")) return Building2;
  if (lowerLabel.includes("country")) return Globe;
  return Ruler;
};

// Updated Review Summary with arrow and smaller fonts, no button
const ReviewSummary = memo(
  ({ hasReviews, reviewCount }: { hasReviews: boolean; reviewCount: number }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        {/* Default view */}
        <div className="flex cursor-pointer items-start gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current text-gray-300" />
            ))}
          </div>
          <p className="text-sm text-gray-500">There are no reviews for this product.</p>
        </div>

        {/* Popover with arrow */}
        {isHovered && (
          <div className="absolute top-full left-0 z-50 mt-3 w-80">
            {/* Arrow pointing up */}
            <div className="relative">
              <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white shadow-lg" />

              {/* Popover content */}
              <div className="animate-in fade-in-0 zoom-in-95 rounded-xl border border-gray-200 bg-white px-7 pt-6 pb-7 shadow-2xl duration-200">
                <p className="mb-4 text-base font-medium text-gray-900">
                  There are no reviews for this product.
                </p>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-medium text-gray-700">{rating}</span>
                      <Star className="h-4 w-4 fill-current text-red-600" />
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gray-300 transition-all duration-500"
                          style={{ width: "0%" }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-medium text-gray-500">(0)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
ReviewSummary.displayName = "ReviewSummary";

export default function ProductDetailPage({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localWishlistLoading, setLocalWishlistLoading] = useState(false);

  const { addItem, loading, error, resetError } = useCartStore();
  const { prefetchProductsBatch } = useProductStore();
  const {
    isInWishlist,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    loading: wishlistLoading
  } = useWishlist();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const inWishlist = isInWishlist(product.id);

  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) return product.images;
    return product.image ? [product.image] : ["/placeholder.svg"];
  }, [product.images, product.image]);

  useEffect(() => {
    if (relatedProducts.length > 0) {
      const relatedIds = relatedProducts.slice(0, 4).map((p) => p.id);
      prefetchProductsBatch(relatedIds);
    }
  }, [relatedProducts, prefetchProductsBatch]);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(product?.colors?.[0]);
    setQuantity(1);
    setShowSuccess(false);
    resetError();
  }, [product.id, product?.colors, resetError]);

  useEffect(() => {
    if (selectedImage >= productImages.length) setSelectedImage(0);
  }, [selectedImage, productImages.length]);

  const handleAddToCart = useCallback(async () => {
    try {
      await addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          model: product.model
        },
        quantity
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setQuantity(1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  }, [product, quantity, addItem]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  // const handleWishlistToggle = useCallback(() => {
  //   if (!isAuthenticated) {
  //     toast.error("Please login to manage your wishlist");
  //     return;
  //   }
  //   setLocalWishlistLoading(true);
  //   const action = inWishlist ? removeFromWishlist : addToWishlist;
  //   action(product.id)
  //     .catch((error) => {
  //       console.error("Wishlist toggle failed:", error);
  //       toast.error(inWishlist ? "Failed to remove from wishlist" : "Failed to add to wishlist");
  //     })
  //     .finally(() => setLocalWishlistLoading(false));
  // }, [isAuthenticated, inWishlist, product.id, addToWishlist, removeFromWishlist]);

  const handleWishlistToggle = useCallback(() => {
    // REMOVED: Authentication check - now guests can add to wishlist too!
    // The store will handle guest vs logged-in users internally

    setLocalWishlistLoading(true);
    const action = inWishlist ? removeFromWishlist : addToWishlist;

    action(product.id)
      .then(() => {
        // Success toast
        if (inWishlist) {
          toast.success("Removed from wishlist");
        } else {
          if (isAuthenticated) {
            toast.success("Added to wishlist");
          } else {
            toast.success("Added to wishlist! Login to sync across devices");
          }
        }
      })
      .catch((error) => {
        console.error("Wishlist toggle failed:", error);
        toast.error(inWishlist ? "Failed to remove from wishlist" : "Failed to add to wishlist");
      })
      .finally(() => {
        setLocalWishlistLoading(false);
      });
  }, [inWishlist, product.id, addToWishlist, removeFromWishlist, isAuthenticated]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        Product not found
      </div>
    );
  }

  const hasReviews = product.reviews > 0;

  return (
    <>
      <style jsx>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes heartBeat {
          0%,
          100% {
            transform: scale(1);
          }
          20% {
            transform: scale(1.2);
          }
          40% {
            transform: scale(1.1);
          }
          60% {
            transform: scale(1.2);
          }
          80% {
            transform: scale(1.1);
          }
        }
        @keyframes glowPulse {
          0%,
          100% {
            filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(239, 68, 68, 0.8));
          }
        }
        .add-to-cart-button {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .add-to-cart-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        }
        .add-to-cart-button:hover::before {
          left: 100%;
          animation: shine 0.8s ease-in-out;
        }
        .add-to-cart-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
        }
        .icon-action-button:hover .icon-heart {
          animation: heartBeat 0.9s ease-in-out;
        }
        .icon-action-button:hover .icon-heart-filled,
        .icon-action-button:hover .icon-heart,
        .icon-action-button:hover .icon-share {
          animation: glowPulse 1.8s infinite;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-bold text-white shadow-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span>Added to cart successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-red-600">{error}</p>
            <button onClick={resetError} className="mt-2 text-sm text-red-800 underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href="/products" className="hover:text-gray-900">
            All Products
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative mx-auto aspect-square max-w-[500px] overflow-hidden rounded-xl bg-gray-100">
              <ProductImage src={productImages[selectedImage]} alt={product.name} priority />
            </div>
            {productImages.length > 1 && (
              <div className="mx-auto grid max-w-[500px] grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <ProductThumbnail
                    key={index}
                    image={image}
                    alt={product.name}
                    index={index}
                    isSelected={selectedImage === index}
                    onClick={() => handleImageSelect(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="mb-3 text-3xl font-bold text-gray-900">{product.name}</h1>

              <div className="mb-6">
                {hasReviews ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                  </div>
                ) : (
                  <ReviewSummary hasReviews={hasReviews} reviewCount={product.reviews} />
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-gray-900">
                  {product.price.toFixed(2)} AED
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {product.originalPrice.toFixed(2)} AED
                  </span>
                )}
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        selectedColor?.name === color.name
                          ? "border-red-600 ring-2 ring-red-600 ring-offset-2"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-md bg-[#f2f2f2] p-[6px]">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={loading || quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 duration-300 hover:border-2 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={loading}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-all duration-300 hover:border-2 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={loading}
                className="add-to-cart-button flex-1 rounded-lg bg-gray-800 py-3 font-bold text-white hover:bg-gray-900">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ADDING...
                  </>
                ) : (
                  "ADD TO CART"
                )}
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading || localWishlistLoading}
                className="icon-action-button group relative flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50">
                {wishlistLoading || localWishlistLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                ) : (
                  <Heart
                    className={`h-6 w-6 transition-all hover:-translate-y-1 ${
                      inWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 group-hover:text-red-500"
                    } icon-heart`}
                    strokeWidth={1.5}
                  />
                )}
              </button>

              <button
                className="icon-action-button group relative flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }
                }}>
                <Share
                  className="icon-share h-6 w-6 text-gray-600 transition-all group-hover:text-gray-900 hover:-translate-y-1"
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Description</h2>
            {product.description && (
              <p className="leading-relaxed text-gray-600">{product.description}</p>
            )}
            {product.features && product.features.length > 0 && (
              <ul className="mt-4 space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-600" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Specification</h2>
              <div className="grid grid-cols-2 gap-6">
                {product.specifications.map((spec, index) => {
                  const IconComponent = getSpecIcon(spec.label);
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <IconComponent className="mt-1 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          {spec.label}
                        </p>
                        <p className="mt-1 font-medium text-gray-900">{spec.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <ReviewsSection productId={product.id} averageRating={product.rating} reviews={[]} />

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
