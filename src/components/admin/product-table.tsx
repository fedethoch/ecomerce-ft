"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  image: string
}

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <span className="font-medium">{product.name}</span>
                </div>
              </TableCell>
              <TableCell className="capitalize">{product.category}</TableCell>
              <TableCell>${product.price.toLocaleString()}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? "En stock" : "Agotado"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
