"use server";

import { OrdersService } from "@/services/orders-service"
import { actionHandler } from "@/lib/handlers/actionHandler"
import { Order, OrderWithDetails } from "@/types/orders/types" // <-- Importa Order
import { AppActionError } from "@/types/types"

const service = new OrdersService()

export const getOrders = async (): Promise<OrderWithDetails[] | AppActionError> => {
  return actionHandler<OrderWithDetails[]>(async () => {
    return service.getOrders()
  })
}

export const getOrder = async (id: string) => {
  return actionHandler(async () => {
    return service.getOrder(id)
  })
}

export const updateOrderStatus = async (id: string, status: string) => {
  return actionHandler(async () => {
    return service.updateOrderStatus(id, status)
  })
}

// --- (MODIFICACIÓN: Nueva Server Action para eliminar) ---
export const deleteOrder = async (id: string) => {
  return actionHandler<Order>(async () => {
    return service.deleteOrder(id)
  })
}
// --- (FIN DE LA MODIFICACIÓN) ---