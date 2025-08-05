"use server";

import { OrdersService } from "@/services/orders-service"
import { actionHandler } from "@/lib/handlers/actionHandler"
import { OrderWithDetails } from "@/types/orders/types"
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