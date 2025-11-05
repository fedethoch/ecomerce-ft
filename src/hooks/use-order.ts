import { useState, useEffect } from "react"
// --- (MODIFICACIÓN 1: Importar la nueva Server Action) ---
import { getOrders, updateOrderStatus, deleteOrder as deleteOrderAction } from "@/controllers/orders-controller"
// --- (FIN MODIFICACIÓN 1) ---
import { OrderWithDetails } from "@/types/orders/types"
import { isAppActionError } from "@/lib/guards"

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await getOrders()
      
      if (isAppActionError(response)) {
        setError(response.userMessage || "Error al cargar pedidos")
      } else {
        setOrders(response)
      }
    } catch (err) {
      setError("Error inesperado al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar el estado de una orden
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus)
      
      if (isAppActionError(response)) {
        setError(response.userMessage || "Error al actualizar el estado")
        return false
      }

      // Actualizar el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )
      return true
    } catch (err) {
      setError("Error inesperado al actualizar el estado")
      return false
    }
  }

  // --- (MODIFICACIÓN 2: Nueva función para eliminar) ---
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await deleteOrderAction(orderId);

      if (isAppActionError(response)) {
        setError(response.userMessage || "Error al eliminar el pedido");
        return false;
      }

      // Actualizar el estado local eliminando la orden
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );
      return true;

    } catch (err) {
      setError("Error inesperado al eliminar el pedido");
      return false;
    }
  }
  // --- (FIN MODIFICACIÓN 2) ---


  useEffect(() => {
    fetchOrders()
  }, [])

  // --- (MODIFICACIÓN 3: Exportar la nueva función) ---
  return { 
    orders, 
    loading, 
    error, 
    updateStatus: handleUpdateStatus,
    deleteOrder: handleDeleteOrder, // <-- Exportar la función
    refetch: fetchOrders 
  }
  // --- (FIN MODIFICACIÓN 3) ---
}