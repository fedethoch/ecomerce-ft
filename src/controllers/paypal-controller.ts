// controllers/payment-controller.ts
"use server"

import { PaymentService } from "@/services/payment-service"
import { AppActionException } from "@/types/exceptions"
import { FinalizePayPalValues } from "@/types/payment/types"
import { OrdersService } from "@/services/orders-service"
import { Order } from "@/types/orders/types"

export async function finalizePayPal(values: FinalizePayPalValues) {
  try {
    const service = new PaymentService()
    const status = await service.capturePayPalOrder(values.token)
    // PayPal devuelve COMPLETED si se acreditó
    const paypalApproved = status === "COMPLETED"

    // Encontrar la orden (guardaste tu order.id en custom_id)
    // Si querés máxima solidez, podés consultar la orden PayPal por ID y leer purchase_units[0].custom_id
    // Para MVP simple, pasá tu orderId también en query (ver paso 5).
    // Suponiendo que venís con ?order_id=<tu order.id>:
    const orderId = values?.["order_id" as keyof FinalizePayPalValues] as string | undefined
    if (orderId) {
      const ordersService = new OrdersService()
      const order = await ordersService.getOrder(orderId)
      if (order) {
        const updated: Order = { ...order, status: paypalApproved ? "approved" : "pending" }
        await ordersService.updateOrder(updated)
      }
    }

    return { status: paypalApproved ? "approved" : "pending" }
  } catch (e: any) {
    throw new AppActionException(
      e?.statusCode ?? 500,
      e?.message ?? "Error al confirmar PayPal",
      e?.userMessage ?? "No se pudo confirmar el pago con PayPal"
    )
  }
}
