"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductTable } from "@/components/admin/product-table"
import { ProductDialog } from "@/components/admin/product-view"
import { Plus } from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import type { ProductType } from "@/types/products/products"

export default function AdminProductsPage() {
  const { 
    products, 
    loading, 
    error, 
    addProduct, 
    editProduct, 
    removeProduct,
    refetch
  } = useProducts()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null)

  const handleAddProduct = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: ProductType) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await removeProduct(productId)
    } catch (err) {
      console.error("Error al eliminar producto", err)
    }
  }

  const handleSaveProduct = async (productData: Omit<ProductType, "id"> & { id?: string }) => {
    try {
      if (editingProduct && editingProduct.id) {
        // Convertir precios a números
        const updates = {
          ...productData,
          price: Number(productData.price),
          originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
          quantity: Number(productData.quantity)
        }
        
        await editProduct(editingProduct.id, updates)
      } else {
        // Crear nuevo producto
        const newProductData = {
          ...productData,
          price: Number(productData.price),
          originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
          quantity: Number(productData.quantity),
          sizes: productData.sizes || [],
          image: [] // Se reemplazará en el servicio
        }
        
        await addProduct(newProductData)
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error al guardar producto", err)
    }
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
        
        {loading ? (
          <p className="text-center py-4">Cargando productos...</p>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-500">No hay productos disponibles</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleAddProduct}
            >
              Crear primer producto
            </Button>
          </div>
        ) : (
          <ProductTable 
            products={products} 
            onEdit={handleEditProduct} 
            onDelete={handleDeleteProduct} 
          />
        )}
        
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