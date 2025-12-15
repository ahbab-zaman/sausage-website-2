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
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import ReviewsSection from "@/components/Review";

type Props = { product: Product; relatedProducts: Product[] };

// Memoized product image component
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

// Memoized thumbnail component
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

// Icon mapping for specifications
const getSpecIcon = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("abv") || lowerLabel.includes("alcohol")) return Wine;
  if (lowerLabel.includes("size")) return Ruler;
  if (lowerLabel.includes("brand")) return Building2;
  if (lowerLabel.includes("country")) return Globe;
  return Ruler;
};

export default function ProductDetailPage({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const { addItem, loading, error, resetError } = useCartStore();
  const { prefetchProductsBatch } = useProductStore();

  // Memoize product images
  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : ["/placeholder.svg"];
  }, [product.images, product.image]);

  // Prefetch related products on mount
  useEffect(() => {
    if (relatedProducts.length > 0) {
      const relatedIds = relatedProducts.slice(0, 4).map((p) => p.id);
      prefetchProductsBatch(relatedIds);
    }
  }, [relatedProducts, prefetchProductsBatch]);

  // Reset states when product changes
  useEffect(() => {
    setSelectedImage(0);
    setSelectedColor(product?.colors?.[0]);
    setQuantity(1);
    setShowSuccess(false);
    resetError();
  }, [product.id, product?.colors, resetError]);

  // Safety check for selected image
  useEffect(() => {
    if (selectedImage >= productImages.length) {
      setSelectedImage(0);
    }
  }, [selectedImage, productImages.length]);

  const handleAddToCart = useCallback(async () => {
    try {
      await addItem(product.id, quantity);

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset quantity after adding
      setQuantity(1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  }, [product.id, quantity, addItem]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  }, []);

  const handleImageSelect = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        Product not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-black font-bold px-6 py-3 text-white shadow-lg">
          <CheckCircle2 className="h-5 w-5" />
          <span>Added to cart successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-red-600">{error}</p>
          <button onClick={resetError} className="mt-2 text-sm text-red-800 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm text-gray-600">
        <Link href="/" className="transition-colors hover:text-gray-900">
          Home
        </Link>
        <span className="mx-2">›</span>
        <Link href="/products" className="transition-colors hover:text-gray-900">
          All Products
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Images */}
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

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.reviews > 0 ? (
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-current text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">({product.reviews} reviews)</span>
              </div>
            ) : (
              <p className="mb-4 text-sm text-gray-500">There are no reviews for this product.</p>
            )}
            <div className="flex items-center space-x-4">
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

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">Color</h3>
              <div className="flex space-x-3">
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

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md bg-[#f2f2f2] p-[6px]">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={loading || quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="w-full">
              <Button
                onClick={handleAddToCart}
                disabled={loading}
                className="w-full bg-gray-800 py-[6px] hover:bg-gray-900"
                size="lg">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ADDING...
                  </>
                ) : (
                  "ADD TO CART"
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button variant="outline" size="lg" className="border-gray-300">
              <Heart className="h-9 w-9" />
            </Button>
            <Button variant="outline" size="lg" className="border-gray-300">
              <Share />
            </Button>
          </div>
        </div>
      </div>

      {/* Description and Specifications Section */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Description */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Description</h2>
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}
          {product.features && product.features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="bg-primary h-2 w-2 rounded-full" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Specification</h2>
            <div className="grid grid-cols-2 gap-6">
              {product.specifications.map((spec, index) => {
                const IconComponent = getSpecIcon(spec.label);
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <IconComponent className="mt-1 h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">{spec.label}</p>
                      <p className="mt-1 font-medium text-gray-900">{spec.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <ReviewsSection productId={product.id} averageRating={product.rating} reviews={[]} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
