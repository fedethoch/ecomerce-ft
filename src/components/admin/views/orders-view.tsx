"use client"

import { Eye, Edit, MoreHorizontal, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SearchFilterBar } from "../search-filter-bar"
import { useOrders } from "@/hooks/use-orders"
import { getOrderStatusBadgeVariant } from "@/lib/helpers/order-helpers"

export function OrdersView() {
  const { orders, loading, error, updateStatus } = useOrders()
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({})

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrders(prev => ({ ...prev, [orderId]: true }))
      await updateStatus(orderId, newStatus)
    } catch (err) {
      console.error("Error al actualizar estado:", err)
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [orderId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">Gestiona todos los pedidos de tu tienda ({orders.length} pedidos)</p>
      </div>

      <SearchFilterBar placeholder="Buscar pedidos..." />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>Todos los pedidos de tu tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-[70px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.user?.name || "Usuario desconocido"}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getOrderStatusBadgeVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.order_items?.length || 0}</TableCell>
                  <TableCell>${order.total_amount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          {updatingOrders[order.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, "Procesando")}
                          disabled={updatingOrders[order.id]}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {updatingOrders[order.id] ? "Actualizando..." : "Marcar como Procesando"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, "Enviado")}
                          disabled={updatingOrders[order.id]}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {updatingOrders[order.id] ? "Actualizando..." : "Marcar como Enviado"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(order.id, "Completado")}
                          disabled={updatingOrders[order.id]}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {updatingOrders[order.id] ? "Actualizando..." : "Marcar como Completado"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}