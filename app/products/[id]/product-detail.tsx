"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, Heart, Minus, Plus, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/schemas";
import Image from "next/image";
import Link from "next/link";

type Props = { product: Product; relatedProducts: Product[] };

export default function ProductDetailPage({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  // Memoize product images to ensure consistent array
  const productImages = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    // Fallback to single image if no images array
    return product.image ? [product.image] : ["/placeholder.svg"];
  }, [product.images, product.image]);

  // Reset ALL states when product changes - critical fix
  useEffect(() => {
    console.log("Product changed to:", product.id); // Debug log
    setSelectedImage(0);
    setSelectedColor(product?.colors?.[0]);
    setQuantity(1);
  }, [product.id, product?.colors]);

  // Safety check: if selectedImage is out of bounds, reset it
  useEffect(() => {
    if (selectedImage >= productImages.length) {
      setSelectedImage(0);
    }
  }, [selectedImage, productImages.length]);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        Product not found
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0],
      quantity: quantity
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm text-gray-600">
        <Link href="/" className="transition-colors hover:text-gray-900">
          Home
        </Link>
        <span className="mx-2">›</span>
        <Link
          href={`/categories/${product.category}`}
          className="transition-colors hover:text-gray-900">
          {product.category}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative mx-auto aspect-square max-w-[500px] overflow-hidden rounded-xl bg-gray-100">
            <Image
              key={`${product.id}-${selectedImage}`}
              fill
              src={productImages[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              className="object-contain p-8"
              priority
            />
          </div>
          {productImages.length > 1 && (
            <div className="mx-auto grid max-w-[500px] grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={`${product.id}-thumb-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 transition-all ${
                    selectedImage === index
                      ? "border-red-600 ring-2 ring-red-600 ring-offset-2"
                      : "border-gray-300 hover:border-gray-400"
                  }`}>
                  <Image
                    width={100}
                    height={100}
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{product.name}</h1>
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
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

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
          <div>
            <h3 className="mb-3 font-semibold text-gray-900">Quantity</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-gray-50">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 transition-colors hover:bg-gray-50">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button onClick={handleAddToCart} className="flex-1" size="lg">
              Add to Cart
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          {/* Shipping Info */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center space-x-3">
              <Truck className="text-primary h-5 w-5" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-muted-foreground text-sm">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="text-primary h-5 w-5" />
              <div>
                <p className="font-medium">30-Day Returns</p>
                <p className="text-muted-foreground text-sm">Free returns within 30 days</p>
              </div>
            </div>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="mb-3 font-semibold text-gray-900">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="bg-primary h-2 w-2 rounded-full" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Related Products</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
