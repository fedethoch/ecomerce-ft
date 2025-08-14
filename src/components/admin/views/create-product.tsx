"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/hooks/use-products"
import type { ProductType } from "@/types/products/products"

interface CreateProductViewProps {
  setActiveView: (view: string) => void
}

export function CreateProductView({ setActiveView }: CreateProductViewProps) {
  const { addProduct } = useProducts()
  const [loading, setLoading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [mainImageIndex, setMainImageIndex] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<Omit<ProductType, "id">>({
    name: "",
    price: 0,
    quantity: 0,
    category: "",
    isNew: false,
    isSale: false,
    sizes: [],
    originalPrice: 0,
    imagePaths: [],
    description: "",
  })

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!imageFiles) {
      alert("Por favor selecciona una imagen");
      setLoading(false);
      return;
    }
    if (formData.description.length < 10) {
      alert("Descripcion minimo 10 caracteres");
      setLoading(false);
      return;
    }
    try {
      console.log("Iniciando creación de producto...");
      const result = await addProduct(formData, imageFiles);
      
      if (result) {
        console.log("Producto creado exitosamente:", result);
        setActiveView("products");
      } else {
        console.warn("La creación del producto no devolvió resultado");
      }
    } catch (error: any) {
      console.error("Error detallado al crear producto:", error);
      alert(`Error al crear producto: ${error.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
      setMainImageIndex(0) // reset principal al agregar nuevas imágenes
    }
  }


  const handleRemoveImage = (idx: number) => {
    setImageFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== idx)
      // Si eliminamos la principal, la nueva principal será la 0
      if (idx === mainImageIndex) {
        setMainImageIndex(0)
      } else if (idx < mainImageIndex) {
        setMainImageIndex(mainImageIndex - 1)
      }
      return newFiles
    })
  }


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
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        price: value === "" ? 0 : Number.parseFloat(value)
                      }))
                    }}
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
                    value={formData.originalPrice === 0 ? "" : formData.originalPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        originalPrice: value === "" ? 0 : Number.parseFloat(value)
                      }))
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Stock</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.quantity === 0 ? "" : formData.quantity} // Muestra vacío cuando es 0
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      quantity: value === "" ? 0 : Number.parseInt(value)
                    }))
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción del producto"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  minLength={10}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                  />
                  <Label htmlFor="is_new">Producto Nuevo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_sale"
                    checked={formData.isSale}
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
                      variant={formData.sizes.includes(size) ? "default" : "outline"}
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
                <div className="flex items-start gap-3 flex-wrap flex-col">
                  {/* Imágenes seleccionadas arriba */}
                  {imageFiles.length > 0 && (
                    <div className="flex gap-4 flex-wrap mb-2">
                      {imageFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative group flex flex-col items-center"
                          style={{ width: 90 }}
                        >
                          <div
                            className={`rounded-lg overflow-hidden border transition-all duration-300
                              ${idx === mainImageIndex
                                ? "ring-2 ring-blue-500 scale-105 shadow-lg"
                                : "hover:ring-2 hover:ring-blue-300"}
                          `}
                          style={{ width: 80, height: 80, cursor: "pointer" }}
                          onClick={() => setMainImageIndex(idx)}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                          />
                          {/* Badge principal */}
                          {idx === mainImageIndex && (
                            <span className="absolute top-1 left-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white text-xs px-2 py-0.5 rounded shadow font-semibold z-10">
                              Principal
                            </span>
                          )}
                        </div>
                        <span className="text-xs max-w-[80px] truncate mt-2 text-center">{file.name}</span>
                        {/* Botón eliminar debajo de la imagen */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="mt-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors duration-200"
                          title="Eliminar imagen"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  )}

                  {/* Botón para seleccionar imágenes */}
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar Imágenes
                    </Button>
                  </div>

                  {/* Texto debajo */}
                  <p className="text-xs text-muted-foreground mt-2">
                    Imágenes del Producto<br />
                    Formatos: JPG, PNG, WEBP. Máx. 5MB
                  </p>
                </div>
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