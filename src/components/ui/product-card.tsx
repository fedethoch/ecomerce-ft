"use client";

// import { useState } from "react"; // <--- Eliminado
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
// import { useCart } from "@/context/cart-context"; // No se usa aquí
import type { ProductType } from "@/types/products/products";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/hooks/use-favorites"; // <-- 1. Importar hook
import { cn } from "@/lib/utils"; // <-- Importar cn

interface ProductCardProps {
  product: ProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  // const [isLiked, setIsLiked] = useState(false); // <--- Eliminado
  const router = useRouter();
  const { favoriteIds, toggleFavorite, isLoading } = useFavorites(); // <-- 2. Usar contexto

  // 3. El estado ahora es global
  const isLiked = favoriteIds.includes(product.id);

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que se navegue al producto
    toggleFavorite(product.id); // <-- 4. Llamar a la función del contexto
  };

  const mainImage =
    Array.isArray(product.imagePaths) && product.imagePaths.length > 0
      ? product.imagePaths[0]
      : "/placeholder.svg";

  // Quitamos los console.log
  
  return (
    <div className="group relative h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>
            )}
            {product.isSale && (
              <Badge className="bg-red-500 hover:bg-red-600">Oferta</Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleToggleLike}
            disabled={isLoading} // <-- 5. Deshabilitar mientras carga
          >
            <Heart
              className={cn( // <-- Usar cn
                "h-4 w-4 transition-all",
                isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
              )}
            />
          </Button>

          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              className="w-full bg-white text-black hover:bg-gray-100 z-10"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/productos/${product.id}`);
              }}
            >
              Ver Producto
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4 h-full ">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-medium text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 capitalize">
            {product.category}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              ${product.price.toLocaleString("es-AR")}
            </span>

            {product.isSale && product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <span
                  key={size}
                  className="text-xs border border-gray-200 px-2 py-1 rounded"
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}