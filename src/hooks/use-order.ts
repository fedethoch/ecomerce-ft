import { useState, useEffect } from "react"
import { getOrder } from "@/controllers/orders-controller"
import { OrderWithDetails } from "@/types/orders/types"
import { isAppActionError } from "@/lib/guards"

export function useOrder(id: string) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await getOrder(id)
        
        if (isAppActionError(response)) {
          setError(response.userMessage || "Error al cargar el pedido")
        } else {
          setOrder(response)
        }
      } catch (err) {
        setError("Error inesperado al cargar el pedido")
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchOrder()
  }, [id])

  return { order, loading, error }
}