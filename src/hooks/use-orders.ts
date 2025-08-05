import { useState, useEffect } from "react"
import { getOrders, updateOrderStatus } from "@/controllers/orders-controller"
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

  useEffect(() => {
    fetchOrders()
  }, [])

  return { 
    orders, 
    loading, 
    error, 
    updateStatus: handleUpdateStatus, // Añadido aquí
    refetch: fetchOrders 
  }
}