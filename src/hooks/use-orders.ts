import { useState, useEffect } from "react"
import { getOrders } from "@/controllers/orders-controller"
import { OrderWithDetails } from "@/types/orders/types"
import { isAppActionError } from "@/lib/guards"

export function useOrders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

    fetchOrders()
  }, [])

  return { orders, loading, error }
}