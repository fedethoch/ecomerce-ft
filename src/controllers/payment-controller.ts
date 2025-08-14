// controllers/payment-controller.ts
"use server"

import { PaymentService } from "@/services/payment-service"
import { AppActionException } from "@/types/exceptions"
import { CreatePreferenceValues } from "@/types/payment/types"

export async function createPreference(values: CreatePreferenceValues) {
  try {
    if (!values?.items || !Array.isArray(values.items) || values.items.length === 0) {
      throw new AppActionException(
        400,
        "Carrito vacío",
        "Tu carrito está vacío"
      )
    }

    const items = values.items
      .map((i) => ({ product_id: String(i.product_id), quantity: Number(i.quantity) }))
      .filter((i) => i.product_id && i.quantity > 0)

    if (items.length === 0) {
      throw new AppActionException(
        400,
        "Carrito inválido",
        "Hay productos con cantidad 0 o inválida"
      )
    }

    const service = new PaymentService()
    return await service.createPreference({
      payment_method: values.payment_method,
      items,
    })
  } catch (e: any) {
    // Si ya es AppActionException, lo re-lanzamos para preservar status y mensajes
    if (e instanceof AppActionException) throw e

    // Fallback genérico
    throw new AppActionException(
      e?.statusCode ?? 500,
      e?.message ?? "Error al iniciar el pago",
      e?.userMessage ?? "No se pudo iniciar el pago",
      e?.fieldErrors
    )
  }
}
