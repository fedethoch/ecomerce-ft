"use client"

import { useState } from "react"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductList } from "@/components/products/product-list"
import { ProductPagination } from "@/components/products/product-pagination"
import { mockProducts } from "@/lib/mock-data"

export default function ProductsPage() {
  const [filteredProducts, setFilteredProducts] = useState(mockProducts)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  const handleFilterChange = (filters: any) => {
    let filtered = mockProducts

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((product) => product.category === filters.category)
    }

    if (filters.priceRange) {
      filtered = filtered.filter(
        (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
      )
    }

    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter((product) => product.sizes.some((size) => filters.sizes.includes(size)))
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
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
            <p className="text-muted-foreground">{filteredProducts.length} productos encontrados</p>
          </div>
          <ProductList products={currentProducts} />
          <ProductPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
