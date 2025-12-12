// app/products/[id]/page.tsx
import ProductDetailPage from "./product-detail";
import { apiClient } from "@/lib/api/client";

// Updated interface for Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params }: PageProps) {
  // Await params in Next.js 15
  const { id } = await params;

  // Fetch single product from API
  const product = await apiClient.getProductById(id);

  // If product not found, show fallback
  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        Product not found
      </div>
    );
  }

  // Fetch all products to get related ones
  const allProducts = await apiClient.getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
