"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProducts } from "@/hooks/use-products"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { getProductStatus } from "@/lib/helpers/product-helpers"
import type { ProductType } from "@/types/products/products"



export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { getProduct } = useProducts()
  const [product, setProduct] = useState<ProductType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
    interface LabelProps {
  children: React.ReactNode;
  className?: string; // Añadir esta línea
}

    const Label = ({ children, className }: LabelProps) => (
    <p className={`text-sm font-medium leading-none ${className || ''}`}>
        {children}
    </p>
    );
    
    
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await getProduct(params.id)
        if (productData) {
          setProduct(productData)
        } else {
          setError("Producto no encontrado")
        }
      } catch (err) {
        setError("Error al cargar el producto")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, getProduct])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle del Producto</h1>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle del Producto</h1>
          <p className="text-destructive">{error}</p>
          <Button className="mt-4" onClick={() => router.push("/admin/products")}>
            Volver a Productos
          </Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle del Producto</h1>
          <p className="text-destructive">Producto no encontrado</p>
          <Button className="mt-4" onClick={() => router.push("/admin/products")}>
            Volver a Productos
          </Button>
        </div>
      </div>
    )
  }

  const status = getProductStatus(product)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detalle del Producto</h1>
          <p className="text-muted-foreground">Información completa de {product.name}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/products")}>
          Volver a Productos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>Categoría: {product.category}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-2">
                <Label className="font-semibold">Imágenes</Label>
                <div className="flex gap-2 flex-wrap">
                  {product.image.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="h-32 w-32 rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>

              
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Precio</Label>
                <div className="flex flex-col">
                  <span className="text-xl">${product.price}</span>
                  {product.isSale && product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Stock</Label>
                <p>{product.quantity} unidades</p>
              </div>

              <div>
                <Label className="font-semibold">Estado</Label>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      status === "Activo" ? "default" : status === "Bajo Stock" ? "secondary" : "destructive"
                    }
                  >
                    {status}
                  </Badge>
                  {product.isNew && <Badge variant="outline">Nuevo</Badge>}
                  {product.isSale && <Badge variant="destructive">Oferta</Badge>}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Tallas Disponibles</Label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes?.map((size) => (
                    <Badge key={size} variant="outline">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Categoría</Label>
                <p>{product.category}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

