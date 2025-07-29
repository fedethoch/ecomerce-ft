"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: any) => void
  product?: any
}

export function ProductDialog({ isOpen, onClose, onSave, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
    sizes: [] as string[],
  })

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        stock: product.stock?.toString() || "",
        image: product.image || "",
        sizes: product.sizes || [],
      })
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: "",
        sizes: [],
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      price: Number.parseFloat(formData.price),
      stock: Number.parseInt(formData.stock),
    })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hombre">Hombre</SelectItem>
                <SelectItem value="mujer">Mujer</SelectItem>
                <SelectItem value="accesorios">Accesorios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">URL de Imagen</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{product ? "Actualizar" : "Crear"} Producto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
