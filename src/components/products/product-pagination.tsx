"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ProductPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductPagination({ currentPage, totalPages, onPageChange }: ProductPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
