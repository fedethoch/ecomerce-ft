"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/hooks/use-products"
import type { ProductType } from "@/types/products/products"

interface EditProductViewProps {
  productId: string
  setActiveView: (view: string, productId?: string) => void
}

export function EditProductView({ productId, setActiveView }: EditProductViewProps) {
  const { editProduct, getProduct } = useProducts()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Cargar el producto cuando el componente se monte
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const productData = await getProduct(productId)
        if (productData) {
          setFormData({
            ...productData,
            isNew: productData.isNew ?? false,
            isSale: productData.isSale ?? false,
            image: productData.image || []
          })
        }
      } catch (err) {
        console.error("Error al cargar el producto:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Preparar los datos del producto
      const productData: Partial<ProductType> = {
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
      
      await editProduct(productId, productData)
      setActiveView("products")
    } catch (error) {
      console.error("Error al actualizar producto:", error)
    } finally {
      setIsSubmitting(false)
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

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(formData.image || [])]
    newImages[index] = value
    setFormData(prev => ({ ...prev, image: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({ 
      ...prev, 
      image: [...(prev.image || []), ""] 
    }))
  }

  const removeImageField = (index: number) => {
    const newImages = [...(formData.image || [])]
    newImages.splice(index, 1)
    setFormData(prev => ({ ...prev, image: newImages }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
            <p className="text-muted-foreground">Modifica los detalles de tu producto</p>
          </div>
          <Button variant="outline" onClick={() => setActiveView("products")}>
            Volver a Productos
          </Button>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
          <p className="text-muted-foreground">Modifica los detalles de tu producto</p>
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
                  value={formData.name || ''}
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
                    value={formData.price || 0}
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
                    value={formData.originalPrice || ''}
                    onChange={(e) =>
                      setFormData(prev => ({ 
                        ...prev, 
                        originalPrice: e.target.value 
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
                  value={formData.quantity || 0}
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
                  value={formData.category || ''}
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
                    checked={formData.isNew || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                  />
                  <Label htmlFor="is_new">Producto Nuevo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_sale"
                    checked={formData.isSale || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isSale: e.target.checked }))}
                  />
                  <Label htmlFor="is_sale">En Oferta</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
              <CardDescription>Configura tallas e imágenes</CardDescription>
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
                <Label>Imágenes</Label>
                <div className="space-y-3">
                  {(formData.image || []).map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="URL de la imagen"
                        value={url}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImageField(index)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={addImageField}
                  >
                    Añadir otra imagen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setActiveView("products")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Actualizando..." : "Actualizar Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}