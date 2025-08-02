"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/hooks/use-products"
import { ProductType } from "@/types/products/products"


interface CreateProductViewProps {
  setActiveView: (view: string) => void
}

export function CreateProductView({ setActiveView }: CreateProductViewProps) {
  const { addProduct } = useProducts()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ProductType>>({
    name: "",
    price: 0,
    quantity: 0,
    category: "",
    isNew: false,
    isSale: false,
    sizes: [] as string[],
    image: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData: Omit<ProductType, "id"> = {
        name: formData.name || "",
        price: formData.price || 0,
        originalPrice: formData.originalPrice,
        quantity: formData.quantity || 0,
        category: formData.category || "",
        isNew: formData.isNew || false,
        isSale: formData.isSale || false,
        sizes: formData.sizes || [],
        image: formData.image || []
      }
      
      await addProduct(productData)
      setActiveView("products")
    } catch (error) {
      console.error("Error al crear producto:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes 
        ? prev.sizes.includes(size)
          ? prev.sizes.filter(s => s !== size)
          : [...prev.sizes, size]
        : [size]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Producto</h1>
          <p className="text-muted-foreground">Añade un nuevo producto a tu inventario</p>
        </div>
        <Button variant="outline" onClick={() => setActiveView("products")}>
          Volver a Productos
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Detalles principales del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  placeholder="Ej: Camiseta Básica Blanca"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        price: Number.parseFloat(e.target.value) || 0 
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original_price">Precio Original (opcional)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.originalPrice || ""}
                    onChange={(e) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        original_price: e.target.value 
                          ? Number.parseFloat(e.target.value) 
                          : undefined
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Stock</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    quantity: Number.parseInt(e.target.value) || 0 
                  }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="camisetas">Camisetas</SelectItem>
                    <SelectItem value="pantalones">Pantalones</SelectItem>
                    <SelectItem value="vestidos">Vestidos</SelectItem>
                    <SelectItem value="chaquetas">Chaquetas</SelectItem>
                    <SelectItem value="calzado">Calzado</SelectItem>
                    <SelectItem value="accesorios">Accesorios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_new"
                    checked={formData.isNew}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_new: e.target.checked }))}
                  />
                  <Label htmlFor="is_new">Producto Nuevo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_sale"
                    checked={formData.isSale}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_sale: e.target.checked }))}
                  />
                  <Label htmlFor="is_sale">En Oferta</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
              <CardDescription>Configura tallas y otros detalles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sizes">Tallas Disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <Button
                      key={size}
                      type="button"
                      variant={formData.sizes?.includes(size) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL de Imagen</Label>
                <Input
                  placeholder="https://ejemplo.com/imagen.jpg"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ 
                        ...prev, 
                        images: [e.target.value] 
                      }))
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setActiveView("products")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}