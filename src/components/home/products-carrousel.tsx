"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { ProductType } from "@/types/products/products";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carrousel";
// --- (MODIFICACIÓN 1: Importar íconos y hooks) ---
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites"; // Asumo la ruta de tu hook

export default function ProductCarrousel({
  products = [],
  title,
  loading,
  error,
}: {
  products?: ProductType[];
  title?: string;
  loading?: boolean;
  error?: string | null;
}) {
  const featured = products || [];
  const hasItems = featured.length > 0;

  // --- (MODIFICACIÓN 2: Llamar al hook de favoritos) ---
  // Hacemos esto aquí para que todos los items del carrusel usen el mismo estado
  const { favoriteIds, toggleFavorite, isLoading: favoritesLoading } = useFavorites();

  if (loading) {
    // ... (Skeleton no cambia)
    return (
      <section className={cn("w-full bg-background py-16")}>
        <div className="max-w-full mx-auto px-4">
          <Header title={""} countHint="cargando…" />
          <div className="flex gap-4 overflow-hidden mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[260px] max-w-[260px] h-[420px] bg-accent/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    // ... (Error no cambia)
  }

  if (!hasItems) {
    // ... (No items no cambia)
  }

  return (
    <section className={cn("w-full bg-background py-12 sm:py-16")}>
      <div className="relative w-full px-2 sm:px-3 md:px-4">
        <Header title={title} countHint={`${featured.length}`} />

        <Carousel
          opts={{ align: "center", loop: true }}
          className="w-full relative mt-2"
        >
          <CarouselContent className="-ml-2 sm:-ml-3 md:-ml-4 py-2">
            {featured.map((p) => {
              // --- (MODIFICACIÓN 3: Lógica del botón de favorito) ---
              const isLiked = favoriteIds.includes(p.id);
              
              const handleToggleLike = (e: React.MouseEvent) => {
                e.preventDefault(); // Evita que el Link se active
                e.stopPropagation(); // Detiene la propagación al Link
                toggleFavorite(p.id);
              };
              // --- (FIN MODIFICACIÓN 3) ---

              return (
                <CarouselItem
                  key={p.id}
                  className="pl-2 sm:pl-3 md:pl-4 basis-[88%] xs:basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <article className="group transition-all duration-300">
                    <Link
                      href={`/productos/${p.id}`}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg transition-all duration-300"
                    >
                      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="relative w-full h-[320px] md:h-[360px] overflow-hidden bg-gray-50">
                          <SafeProductImage
                            imagePaths={p.imagePaths} // <-- 4. Pasamos imagePaths
                            name={p.name}
                          />
                          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5" />

                          {/* --- (MODIFICACIÓN 5: Añadir botón de favorito) --- */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            onClick={handleToggleLike}
                            disabled={favoritesLoading}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4 transition-all",
                                isLiked
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-500"
                              )}
                            />
                          </Button>
                          {/* --- (FIN MODIFICACIÓN 5) --- */}
                          
                        </div>

                        <div className="p-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                          </div>

                          <h3 className="text-sm md:text-base font-semibold text-gray-900 line-clamp-2 min-h-[2rem] leading-tight group-hover:text-primary transition-colors">
                            {p.name}
                          </h3>

                          <div className="pt-0.5 border-t border-gray-100">
                            <PriceBlock
                              price={p.price}
                              originalPrice={p.originalPrice} // <-- Corregido
                            />
                          </div>

                          <div className="pt-1">
                            <div className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium text-center transition-all duration-300 group-hover:bg-primary transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                              Ver Producto
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* ... (Flechas no cambian) ... */}
          <CarouselPrevious
            className={cn(
              "absolute left-1 sm:left-2 md:-left-2 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-border",
              "hover:bg-[#1E3A8A] hover:text-white transition-all duration-300",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          />
          <CarouselNext
            className={cn(
              "absolute right-1 sm:right-2 md:-right-2 top-1/2 -translate-y-1/2 z-20",
              "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-border",
              "hover:bg-[#1E3A8A] hover:text-white transition-all duration-300",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          />
        </Carousel>
      </div>
    </section>
  );
}

function Header({ title, countHint }: { title: string; countHint?: string }) {
  // ... (sin cambios)
  return (
    <div className="flex items-end justify-between mb-2">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-[#0B1220] mb-2">
          {title}
        </h2>
        <div className="w-20 h-1 bg-primary rounded-full"></div>
      </div>
      {countHint && (
        <div className="bg-card/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
          <span className="text-sm text-[#6B7280] font-medium">
            {countHint} productos
          </span>
        </div>
      )}
    </div>
  );
}

function PriceBlock({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice?: number;
}) {
  // ... (sin cambios)
  const hasDiscount = originalPrice && originalPrice > price;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-lg font-bold text-gray-900">
        ${price.toFixed(2)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-sm line-through text-gray-500">
            ${originalPrice!.toFixed(2)}
          </span>
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-semibold">
            -{Math.round(((originalPrice! - price) / originalPrice!) * 100)}%
          </span>
        </>
      )}
    </div>
  );
}

// --- (MODIFICACIÓN 4: Actualizar SafeProductImage) ---
// Hacemos que coincida con la lógica de product-card.tsx
function SafeProductImage({
  imagePaths,
  name,
}: {
  imagePaths?: string[]; // Tu ProductType usa 'imagePaths'
  name: string;
}) {
  const src =
    Array.isArray(imagePaths) && imagePaths.length > 0
      ? imagePaths[0]
      : "/placeholder.svg";
      
  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-cover group-hover:scale-105 transition-transform duration-500"
      sizes="(max-width: 768px) 90vw, (max-width: 1280px) 60vw, 480px"
    />
  );
}
// --- (FIN MODIFICACIÓN 4) ---