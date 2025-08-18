// controllers/shipping-controller.ts
"use server"

import { ShippingService } from "@/services/shipping-services"
import { AppActionException } from "@/types/exceptions"
import { AddressInput, CartItemForShipping } from "@/types/shipping/types"

const svc = new ShippingService()

export async function quoteShipping(params: { items: CartItemForShipping[], address: AddressInput }) {
  try {
    if (!params?.items?.length) throw new AppActionException(400, "Carrito vacío", "Tu carrito está vacío")
    if (!params?.address?.state || !params?.address?.postal_code)
      throw new AppActionException(400, "Dirección incompleta", "Completá provincia y código postal")

    return await svc.quote(params.items, params.address)
  } catch (e: any) {
    if (e instanceof AppActionException) throw e
    throw new AppActionException(500, e?.message ?? "Error al cotizar envío", "No se pudo cotizar el envío")
  }
}
