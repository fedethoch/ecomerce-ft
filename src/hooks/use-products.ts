"use client"

import { useState, useEffect } from "react"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/controllers/products-controller"
import type { ProductType } from "@/types/products/products"
import { AppActionError } from "@/types/types"

export function useProducts() {
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAppActionError = (value: unknown): value is AppActionError => {
    return (value as AppActionError)?.statusCode !== undefined
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()

      if (isAppActionError(data)) {
        setError(data.userMessage || data.message)
        return
      }

      setProducts(data)
      setError(null)
    } catch (err) {
      setError("Error al cargar productos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: Omit<ProductType, "id">) => {
    try {
      // Aquí el createProduct necesita el file, ajusta según tu caso
      const newProduct = await createProduct(productData as any, {} as File)

      if (isAppActionError(newProduct)) {
        setError(newProduct.userMessage || newProduct.message)
        return
      }

      setProducts((prev) => [...prev, newProduct])
      return newProduct
    } catch (err) {
      setError("Error al crear producto")
      throw err
    }
  }

  const editProduct = async (
    id: string,
    updates: Partial<Omit<ProductType, "id">>
  ) => {
    try {
      const updatedProduct = await updateProduct(id, updates)

      if (isAppActionError(updatedProduct)) {
        setError(updatedProduct.userMessage || updatedProduct.message)
        return
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      )
      return updatedProduct
    } catch (err) {
      setError("Error al actualizar producto")
      throw err
    }
  }

  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError("Error al eliminar producto")
      throw err
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
  }
}
