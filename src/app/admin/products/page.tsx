"use client";

import { Plus, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";
import { useProducts } from "@/hooks/use-products";
import { getProductStatus } from "@/lib/helpers/product-helpers";
import { useRouter, useSearchParams } from "next/navigation"; // Importamos el router
import { useAdminLayout } from "@/context/layout-context";

export default function Page() {
  const { products, loading, error, removeProduct, refetch } = useProducts();
  const router = useRouter(); // Usamos el router para navegación
  const { open } = useAdminLayout();
  const searchParams = useSearchParams();

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await removeProduct(id);
        // Actualizar la lista después de eliminar
        refetch();
      } catch (err) {
        console.error("Error al eliminar producto:", err);
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-full">
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de ropa ({products.length} productos)
          </p>
        </div>
      </div>

      <div className=" flex w-full justify-between items-center">
        <SearchFilterBar placeholder="Buscar productos..." />
        <Button
          className="w-25%"
          onClick={() => router.push("/admin/products/create")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            Gestiona todos tus productos desde aquí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[70px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const status = getProductStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={
                          (product.imagePaths && product.imagePaths[0]) ||
                          "/placeholder.svg?height=60&width=60"
                        }
                        alt={product.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>${product.price}</span>
                        {product.isSale && product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge
                          variant={
                            status === "Activo"
                              ? "default"
                              : status === "Bajo Stock"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {status}
                        </Badge>
                        {product.isNew && (
                          <Badge variant="outline">Nuevo</Badge>
                        )}
                        {product.isSale && (
                          <Badge variant="destructive">Oferta</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/productos/${product.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/products/edit/${product.id}`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
