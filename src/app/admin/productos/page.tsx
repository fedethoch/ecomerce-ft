"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/admin/product-table"
import { ProductDialog } from "@/components/admin/product-dialog"
import { mockProducts } from "@/lib/mock-data"
import { Plus } from "lucide-react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productData } : p)))
    } else {
      const newProduct = {
        id: Date.now().toString(),
        ...productData,
      }
      setProducts((prev) => [...prev, newProduct])
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Productos</h1>
          <Button onClick={handleAddProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
        <ProductTable products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
        <ProductDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveProduct}
          product={editingProduct}
        />
      </div>
    </div>
  )
}
