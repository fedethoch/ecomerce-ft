"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { ProductType } from "@/types/products/products"

interface ProductCardProps {
  product: ProductType
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();  
    addItem({
      ...product,
      quantity: 1
    });
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLiked(!isLiked)
  }

  // Usamos la primera imagen del array
  const mainImage = product.image && product.image.length > 0 
    ? product.image[0] 
    : "/placeholder.svg"

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <Link href={`/productos/${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          {/* Imagen principal del producto */}
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">Nuevo</Badge>}
            {product.isSale && <Badge className="bg-red-500 hover:bg-red-600">Oferta</Badge>}
          </div>

          {/* Botón de favoritos */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleToggleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          {/* Botón rápido para añadir al carrito */}
          <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              className="w-full bg-white text-black hover:bg-gray-100 z-10" 
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Agregar al carrito
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-medium text-sm mb-1 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 capitalize">
            {product.category}
          </p>
          <div className="flex items-center gap-2">
            {/* Precio actual */}
            <span className="font-bold text-lg">
              ${product.price.toLocaleString("es-AR")}
            </span>
            
            {/* Mostrar precio original si hay oferta */}
            {product.isSale && product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>
          
          {/* Tallas disponibles */}
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
  )
}