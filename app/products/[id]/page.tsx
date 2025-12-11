// app/products/[id]/page.tsx
import ProductDetailPage from "./product-detail";
import { apiClient } from "@/lib/api/client";

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const { id } = params;

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
