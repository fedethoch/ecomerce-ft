"use client"

import { useEffect, useState } from "react"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductList } from "@/components/products/product-list"
import { ProductPagination } from "@/components/products/product-pagination"
import { getProducts } from "@/controllers/products-controller"
import { ProductType } from "@/types/products/products"
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler"
import { AppActionException } from "@/types/exceptions"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([])
  const [products, setProducts] = useState<ProductType[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const productsPerPage = 12
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await actionErrorHandler(async() => { 
          const res = await getProducts()
          return res
        })
        
        if (data) {
          setProducts(data)
          setFilteredProducts(data)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        if (error instanceof AppActionException) {
          setError(error.userMessage || "Error al cargar productos")
        } else {
          setError("Ocurrió un error al cargar los productos")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleFilterChange = (filters: any) => {
    let filtered = [...products] // Copia para no mutar el estado original

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (product) => product.category === filters.category
      )
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (product) =>
          product.price >= filters.priceRange[0] &&
          product.price <= filters.priceRange[1]
      )
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter((product) =>
        product.sizes.some((size) => filters.sizes.includes(size))
      )
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
          
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center">
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-3">Error al cargar productos</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/4">
          <ProductFilters onFilterChange={handleFilterChange} />
        </aside>
        
        <div className="lg:w-3/4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Productos</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'} encontrados
            </p>
          </div>
          
          {filteredProducts.length > 0 ? (
            <>
              <ProductList products={products} />
              
              {totalPages > 1 && (
                <ProductPagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-xl font-semibold mb-3">No se encontraron productos</h2>
              <p className="text-muted-foreground mb-5 max-w-md">
                No hay productos que coincidan con los filtros seleccionados. 
                Intenta ajustar los filtros o vuelve más tarde.
              </p>
              <button
                onClick={() => {
                  setFilteredProducts(products)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                Restablecer filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}