// src/services/shipping-service.ts
import { ProductsRepository } from "@/repository/products-repository"
import type { AddressInput, CartItemForShipping, ShippingOption } from "@/types/shipping/types"
import type { QuoteInput } from "@/types/shipping/provider/type"   // ✅ origen único de tipos del provider
import { AndreaniProvider } from "@/services/shipping/providers/andreani-provider"

const productsRepo = new ProductsRepository()
const andreani = new AndreaniProvider()

const ORIGIN = {
  postal_code: process.env.SHIPPER_POSTAL_CODE || "1425",
  province: process.env.SHIPPER_PROVINCE || "CABA",
  city: process.env.SHIPPER_CITY || "CABA",
  address_line1: process.env.SHIPPER_ADDRESS || "Origen",
}

// Volumétrico: cm³ / divisor -> kg (muchos carriers usan 4000–6000). Default 5000.
const volumetricDivisor = Number(process.env.VOLUMETRIC_DIVISOR || "5000")

// -------------------------
// Tipo interno con peso/dimensiones obligatorias (type-safe)
// -------------------------
type EnrichedItem = {
  product_id: string
  quantity: number
  weight_grams: number
  length_cm: number
  width_cm: number
  height_cm: number
}

export class ShippingService {
  // NO leemos dims del producto; usamos las del item (si existen) o defaults
  private async enrich(items: CartItemForShipping[]): Promise<EnrichedItem[]> {
    const out: EnrichedItem[] = []
    for (const it of items) {
      const p = await productsRepo.getProduct(it.product_id)
      out.push({
        product_id: it.product_id,
        quantity: it.quantity,
        // peso: item > producto > default
        weight_grams: (it.weight_grams ?? (p as any)?.weight_grams ?? 500) as number,
        // dimensiones: item > default (no tomamos del producto)
        length_cm: (it as any).length_cm ?? 10,
        width_cm:  (it as any).width_cm  ?? 10,
        height_cm: (it as any).height_cm ?? 10,
      })
    }
    return out
  }

  // Peso facturable = max(real, volumétrico)
  private billableWeightGrams(items: EnrichedItem[]) {
    const realGrams = items.reduce((a, i) => a + i.weight_grams * i.quantity, 0)
    const volCm3 = items.reduce((a, i) => a + i.length_cm * i.width_cm * i.height_cm * i.quantity, 0)
    const volKg = volCm3 / volumetricDivisor
    const volGrams = Math.ceil(volKg * 1000)
    return Math.max(realGrams, volGrams)
  }

  /**
   * Cotiza contra el provider real.
   * @param declaredValueARS subtotal de mercadería (seguro)
   */
  async quote(
    items: CartItemForShipping[],
    address: AddressInput,
    opts?: { declaredValueARS?: number }
  ): Promise<ShippingOption[]> {
    const enriched = await this.enrich(items)              // EnrichedItem[]
    const billable = this.billableWeightGrams(enriched)

    const input: QuoteInput = {
      origin: ORIGIN,
      address,
      items: enriched,                                     // ✅ weight_grams ya es number
      weight_total_grams: billable,
      // “caja” agregada simple
      length_cm:  Math.max(...enriched.map(i => i.length_cm)),
      width_cm:   Math.max(...enriched.map(i => i.width_cm)),
      height_cm:  enriched.reduce((a, i) => a + i.height_cm * i.quantity, 0),
      declared_value_ars: opts?.declaredValueARS,
    }

    const optsFromCarrier = await andreani.quote(input)

    return optsFromCarrier.map(o => ({
      method_id: o.method_id,
      label: o.label,
      provider: o.carrier,
      service_level: o.service_level,
      amount: o.amount,
      eta_min_days: o.eta_min_days,
      eta_max_days: o.eta_max_days,
    }))
  }

  async buyLabelForOrder(params: {
    order_id: string
    address: AddressInput
    option: { method_id: string; label: string; amount: number; provider?: string; service_level: "standard" | "express" | "pickup" }
    items: CartItemForShipping[]
  }) {
    const enriched = await this.enrich(params.items)       // EnrichedItem[]
    if (params.option.method_id.startsWith("andreani")) {
      return andreani.buyLabel({
        order_id: params.order_id,
        address: params.address,
        option: {
          carrier: "andreani",
          method_id: params.option.method_id,
          label: params.option.label,
          service_level: params.option.service_level,
          amount: params.option.amount,
          eta_min_days: 0,
          eta_max_days: 0,
        } as any,
        items: enriched,                                   // ✅ peso garantizado
      })
    }
    throw new Error("Carrier no soportado para buyLabel")
  }
}
