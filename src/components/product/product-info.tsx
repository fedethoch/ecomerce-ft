"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import {
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
} from "lucide-react";

import { ProductType } from "@/types/products/products";

export function ProductInfo({ product }: { product: ProductType }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem, cart } = useCart();

  // How many of this product are already in the cart
  const existingInCart = Array.isArray(cart)
    ? (cart.find((p) => p.id === product.id)?.quantity ?? 0)
    : 0;
  const remainingStock = Math.max(0, (product.quantity ?? 0) - existingInCart);

  // Keep selected quantity within allowed range when remainingStock changes
  useEffect(() => {
    if (remainingStock <= 0) {
      setQuantity(1);
    } else if (quantity > remainingStock) {
      setQuantity(Math.max(1, remainingStock));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingStock]);

  // Safe accessors for optional fields
  const reviews = Array.isArray((product as any).reviews)
    ? (product as any).reviews
    : [];
  const features = Array.isArray((product as any).features)
    ? (product as any).features
    : [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) /
        reviews.length
      : 0;

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddItem = () => {
    if (!selectedSize) {
      alert("Por favor selecciona una talla");
      return;
    }

    if (remainingStock <= 0) {
      alert("No hay stock disponible para este producto");
      return;
    }

    const qtyToAdd = Math.min(quantity, remainingStock);
  // addItem accepts (product, desiredQty)
  addItem(product, qtyToAdd);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {product.isNew && <Badge className="bg-green-500">Nuevo</Badge>}
          {product.isSale && <Badge className="bg-red-500">Oferta</Badge>}
          <Badge variant="outline" className="capitalize">
            {product.category}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

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
            {averageRating.toFixed(1)} ({reviews.length} reseñas)
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">
            ${product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
              <Badge className="bg-red-500">{discount}% OFF</Badge>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Precio final con todos los impuestos incluidos
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-2">Descripción</h3>
        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Características</h3>
        <ul className="space-y-2">
          {features.map((feature: any, index: number) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Talla</h3>
          <Button variant="link" className="text-sm p-0 h-auto">
            Guía de tallas
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(product.sizes ?? []).map((size) => (
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

      <div>
        <h3 className="font-semibold mb-3">Cantidad</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() =>
                setQuantity((q) => Math.min(remainingStock, q + 1))
              }
              disabled={quantity >= remainingStock}
            >
              +
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            Stock disponible: {remainingStock}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleAddItem}
            size="lg"
            className="flex-1"
            disabled={!selectedSize || remainingStock <= 0 || quantity <= 0}
          >
            <ShoppingCart className="w-5 h-5 mr-2" /> Agregar al Carrito
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <Button variant="outline" size="lg" className="w-full bg-transparent">
          Comprar Ahora
        </Button>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-primary" />{" "}
          <span>Envío gratis en compras mayores a $50,000</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <RotateCcw className="h-5 w-5 text-primary" />{" "}
          <span>Devolución gratuita hasta 30 días</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-primary" />{" "}
          <span>Garantía de calidad</span>
        </div>
      </div>
    </div>
  );
}
