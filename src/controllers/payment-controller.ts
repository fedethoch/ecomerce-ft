// controllers/payment-controller.ts
"use server"

import { PaymentService } from "@/services/payment-service"
import { AppActionException } from "@/types/exceptions"
import { CreatePreferenceValues } from "@/types/payment/types"

export async function createPreference(values: CreatePreferenceValues) {
  try {
    // ✅ Validación carrito
    if (!values?.items || !Array.isArray(values.items) || values.items.length === 0) {
      throw new AppActionException(400, "Carrito vacío", "Tu carrito está vacío")
    }

    const items = values.items
      .map((i) => ({ product_id: String(i.product_id), quantity: Number(i.quantity) }))
      .filter((i) => i.product_id && i.quantity > 0)

    if (items.length === 0) {
      throw new AppActionException(400, "Carrito inválido", "Hay productos con cantidad 0 o inválida")
    }

    // ✅ Validación envío (si tu checkout requiere envío)
    if (!values.address || !values.address.state || !values.address.postal_code) {
      throw new AppActionException(400, "Dirección incompleta", "Completá provincia y código postal para cotizar el envío")
    }
    if (!values.shipping_method_id) {
      throw new AppActionException(400, "Envío no seleccionado", "Elegí un método de envío")
    }

    // ✅ Llamada al servicio con address y shipping_method_id
    const service = new PaymentService()
    return await service.createPreference({
      payment_method: values.payment_method,
      items,
      address: values.address,                       // 👈 NUEVO
      shipping_method_id: values.shipping_method_id, // 👈 NUEVO
    })
  } catch (e: any) {
    // 🔎 Log completo en server para diagnóstico
    console.error("[createPreference] error:", {
      name: e?.name,
      message: e?.message,
      userMessage: e?.userMessage,
      statusCode: e?.statusCode,
      code: e?.code,
      provider: e?.provider,
      raw: e?.raw,
      error: e?.error,
      cause: e?.cause,
    })

    // 🔐 No logueado
    if (e?.code === "AUTH_REQUIRED" || /usuario no encontrado/i.test(e?.message)) {
      throw new AppActionException(401, "No autenticado", "Debes iniciar sesión para continuar")
    }

    // 📦 Datos faltantes/invalidos
    if (e?.name === "PaymentPreferenceDataNotFoundException") {
      throw new AppActionException(400, e?.message ?? "Datos inválidos", e?.userMessage ?? "Revisá los datos del pago")
    }

    // 🌐 Errores del gateway (MP/PayPal)
    if (e?.name === "PaymentException") {
      const status = Number(e?.statusCode) || 502
      throw new AppActionException(
        status,
        e?.message ?? "Error con el proveedor de pagos",
        e?.userMessage ?? "No se pudo iniciar el pago"
      )
    }

    // 🛑 Fallback genérico
    throw new AppActionException(
      e?.statusCode ?? 500,
      e?.message ?? "Error al iniciar el pago",
      e?.userMessage ?? "No se pudo iniciar el pago",
      e?.fieldErrors
    )
  }
}
