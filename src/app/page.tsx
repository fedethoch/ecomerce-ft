"use client";

import { HeroSection } from "@/components/home/hero-section";
import FeaturedProducts from "@/components/home/products-carrousel";

import { CategorySection } from "@/components/home/category-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { BenefitsBar } from "@/components/home/benefits-bar";
import Reviews from "@/components/home/reviews";
import { Footer } from "@/components/layout/footer";
import { useEffect, useState } from "react";
import { getProducts } from "@/controllers/products-controller";
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler";
import type { ProductType } from "@/types/products/products";
import ProductCarrousel from "@/components/home/products-carrousel";


// ...existing imports

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await actionErrorHandler(getProducts);
        if (!Array.isArray(data))
          throw new Error("Respuesta inválida de productos");

        const normalized: ProductType[] = (data as ProductType[]).map(
          (p) =>
            ({
              id: String(p.id),
              name: String(p.name ?? ""),
              price: Number(p.price ?? 0),
              originalPrice: (p as any).originalPrice ?? undefined,
              quantity: (p as any).quantity ?? (p as any).stock ?? 0,
              category: String((p as any).category ?? ""),
              isNew: Boolean((p as any).isNew ?? (p as any).is_new ?? false),
              isSale: Boolean((p as any).isSale ?? (p as any).is_sale ?? false),
              sizes: Array.isArray((p as any).sizes) ? (p as any).sizes : [],
              description: String((p as any).description ?? ""),
              imagePaths: Array.isArray((p as any).imagePaths)
                ? (p as any).imagePaths
                : (p as any).image
                  ? [(p as any).image]
                  : [],
              image:
                (p as any).image ?? (p as any).imagePaths?.[0] ?? undefined,
              isOutstanding: Boolean(
                (p as any).isOutstanding ?? (p as any).is_outstanding ?? false
              ),
            }) as ProductType
        );

        if (mounted) setProducts(normalized);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err?.message ?? "Error al cargar productos");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const featuredProducts = products.filter((p) => Boolean(p.isOutstanding));
  const newProducts = products.filter((p) => Boolean(p.isNew));
  const saleProducts = products.filter((p) => Boolean(p.isSale));

  return (
    <div className="flex flex-col">
      <BenefitsBar />
      <HeroSection />
      <ProductCarrousel
        {...({
          products: featuredProducts,
          loading,
          error,
          title: "Destacados",
        } as any)}
      />
      <ProductCarrousel
        {...({ products: newProducts, loading, error, title: "Nuevos" } as any)}
      />
      <CategorySection />
      <ProductCarrousel
        {...({
          products: saleProducts,
          loading,
          error,
          title: "En Oferta",
        } as any)}
      />
      <Footer />
    </div>
  );
}
