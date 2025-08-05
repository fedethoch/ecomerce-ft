import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ProductType } from "@/types/products/products"

interface ProductDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: Omit<ProductType, "id"> & { id?: string }) => void
  product?: ProductType | null
}

export function ProductDialog({ isOpen, onClose, onSave, product }: ProductDialogProps) {
  const [formData, setFormData] = useState<Omit<ProductType, "id"> & { id?: string }>({
    name: "",
    price: 0,
    originalPrice: 0,
    quantity: 0,
    category: "",
    isNew: false,
    isSale: false,
    sizes: [],
    image: []
  })

  useEffect(() => {
    if (product) {
      setFormData(product)
    } else {
      setFormData({
        name: "",
        price: 0,
        originalPrice: 0,
        quantity: 0,
        category: "",
        isNew: false,
        isSale: false,
        sizes: [],
        image: []
      })
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="originalPrice">Precio Original (opcional)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  value={formData.originalPrice || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="isNew"
                  name="isNew"
                  type="checkbox"
                  checked={formData.isNew || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="isNew" className="ml-2 block text-sm text-gray-700">
                  Producto Nuevo
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isSale"
                  name="isSale"
                  type="checkbox"
                  checked={formData.isSale || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="isSale" className="ml-2 block text-sm text-gray-700">
                  En Oferta
                </label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="sizes">Tallas (separadas por comas)</Label>
              <Input
                id="sizes"
                name="sizes"
                value={formData.sizes?.join(", ") || ""}
                onChange={(e) => {
                  const sizes = e.target.value.split(",").map(s => s.trim())
                  setFormData(prev => ({ ...prev, sizes }))
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {product ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}