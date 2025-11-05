"use client";

import {
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useOrders } from "@/hooks/use-orders";
import { getOrderStatusBadgeVariant } from "@/lib/helpers/order-helpers";
import { useAdminLayout } from "@/context/layout-context";

export default function OrdersView() {
  const { orders, loading, error, updateStatus, deleteOrder } = useOrders();
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>(
    {}
  );
  const { open } = useAdminLayout();

  // --- MODIFICACIÓN: Corregir bug de foco ---
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Retrasamos el blur() para que se ejecute DESPUÉS de que el menú se cierre
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
    // --- FIN MODIFICACIÓN ---

    try {
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: true }));
      await updateStatus(orderId, newStatus);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    } finally {
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // --- MODIFICACIÓN: Corregir bug de foco ---
  const handleDelete = async (orderId: string) => {
    // Retrasamos el blur()
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
    // --- FIN MODIFICACIÓN ---

    if (!window.confirm("¿Seguro que quieres eliminar este pedido?")) {
      return;
    }
    try {
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: true }));
      await deleteOrder(orderId);
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
    } finally {
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };
  // --- FIN MODIFICACIONES ---

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>Cargando todos los pedidos...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="ml-auto h-4 w-[100px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-destructive">{error}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-lg font-medium">Error al cargar los pedidos</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">
          Gestiona todos los pedidos de tu tienda ({orders.length} pedidos)
        </p>
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
                  <TableCell className="font-medium">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {order.user?.name || "Usuario desconocido"}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
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
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(order.id, "success")
                          }
                          disabled={updatingOrders[order.id]}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Marcar como Success
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(order.id, "pending")
                          }
                          disabled={updatingOrders[order.id]}
                        >
                          <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                          Marcar como Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(order.id, "cancelled")
                          }
                          disabled={updatingOrders[order.id]}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                          Marcar como Cancelled
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDelete(order.id)}
                          disabled={updatingOrders[order.id]}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
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
  );
}