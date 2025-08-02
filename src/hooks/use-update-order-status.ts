import { useState } from "react"
import { updateOrderStatus } from "@/controllers/orders-controller"
import { isAppActionError } from "@/lib/guards"

export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const response = await updateOrderStatus(orderId, newStatus)
      
      if (isAppActionError(response)) {
        setError(response.userMessage || "Error al actualizar estado")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("Error inesperado al actualizar estado")
    } finally {
      setLoading(false)
    }
  }

  return { updateStatus, loading, error, success }
}