"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw, Star } from "lucide-react"

interface ProductInfoProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    category: string
    description: string
    sizes: string[]
    stock: number
    isNew?: boolean
    isSale?: boolean
    features: string[]
    reviews: Array<{
      id: string
      user: string
      rating: number
      comment: string
      date: string
    }>
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const { addItem } = useCart()

  const averageRating = product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleaddItem = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla")
      return
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: "/placeholder.svg?height=400&width=300",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Product Title and Badges */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {product.isNew && <Badge className="bg-green-500">Nuevo</Badge>}
          {product.isSale && <Badge className="bg-red-500">Oferta</Badge>}
          <Badge variant="outline" className="capitalize">
            {product.category}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {averageRating.toFixed(1)} ({product.reviews.length} reseñas)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
              <Badge className="bg-red-500">{discount}% OFF</Badge>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Precio final con todos los impuestos incluidos</p>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Descripción</h3>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      {/* Features */}
      <div>
        <h3 className="font-semibold mb-3">Características</h3>
        <ul className="space-y-2">
          {product.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Talla</h3>
          <Button variant="link" className="text-sm p-0 h-auto">
            Guía de tallas
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              className="h-12"
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="font-semibold mb-3">Cantidad</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            >
              +
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">Stock disponible: {product.stock}</span>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button onClick={handleaddItem} size="lg" className="flex-1">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Agregar al Carrito
          </Button>
          <Button variant="outline" size="lg" onClick={() => setIsLiked(!isLiked)}>
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <Button variant="outline" size="lg" className="w-full bg-transparent">
          Comprar Ahora
        </Button>
      </div>

      {/* Benefits */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-primary" />
          <span>Envío gratis en compras mayores a $50,000</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <RotateCcw className="h-5 w-5 text-primary" />
          <span>Devolución gratuita hasta 30 días</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-primary" />
          <span>Garantía de calidad</span>
        </div>
      </div>
    </div>
  )
}
