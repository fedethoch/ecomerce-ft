"use client";
import { Eye, Edit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useCustomers } from "@/hooks/use-customers";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLayout } from "@/context/layout-context";

export default function CustomersView() {
  const { customers, loading, error, refetch } = useCustomers();
  const { open } = useAdminLayout();

  return (
    <div
      className={`space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8 transition-all duration-300 ${open ? "lg:ml-64" : "lg:ml-16"}`}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Clientes
        </h1>
        <p className="text-muted-foreground">Gestiona tu base de clientes</p>
      </div>

      <SearchFilterBar
        placeholder="Buscar clientes..."
        onSearch={(term) => console.log("Buscar:", term)}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Todos tus clientes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={refetch}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Cliente</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[80px]">Pedidos</TableHead>
                    <TableHead className="min-w-[120px]">
                      Total Gastado
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      Fecha de Registro
                    </TableHead>
                    <TableHead className="w-[70px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback>
                              {customer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate">
                            {customer.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="truncate">
                        {customer.email}
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>${customer.spent}</TableCell>
                      <TableCell>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
