import type {
  ICarrierProvider,
  QuoteInput,
  QuoteOption,
  BuyLabelInput,
  BuyLabelResult
} from "@/types/shipping/provider/type"

// Pequeña ayuda
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export class AndreaniProvider implements ICarrierProvider {
  private base = process.env.ANDREANI_API_BASE || ""   // ej: https://api.andreani.com
  private apiKey = process.env.ANDREANI_API_KEY || ""
  private contract = process.env.ANDREANI_CONTRACT_NUMBER || ""

  private get hasEnv() {
    return !!(this.base && this.apiKey && this.contract)
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      "X-Api-Key": this.apiKey,
    }
  }

  // Fallback por tabla si faltan ENV o API falla
  private fallbackQuote(input: QuoteInput): QuoteOption[] {
    const weight =
      input.weight_total_grams ??
      input.items.reduce((acc, it) => acc + (it.weight_grams ?? 500) * it.quantity, 0)

    // Tarifas DEMO por peso
    const base =
      weight <= 1000 ? 3200 :
      weight <= 3000 ? 4200 :
      7000

    return [
      {
        carrier: "andreani",
        method_id: "andreani_standard",
        label: "Andreani Estándar",
        service_level: "standard",
        amount: base,
        eta_min_days: 2,
        eta_max_days: 5,
      },
      {
        carrier: "andreani",
        method_id: "andreani_express",
        label: "Andreani Exprés",
        service_level: "express",
        amount: round2(base * 1.35),
        eta_min_days: 1,
        eta_max_days: 2,
      },
    ]
  }

  async quote(input: QuoteInput): Promise<QuoteOption[]> {
  if (!this.hasEnv) {
    return this.fallbackQuote(input)
  }

  // ⚠️ Ajustá al payload real de Andreani
  const body = {
    contractNumber: this.contract,
    origin: {
      postalCode: input.origin.postal_code,
      province: input.origin.province,
      city: input.origin.city,
      address: input.origin.address_line1,
    },
    destination: {
      province: input.address.state,
      postalCode: input.address.postal_code,
      city: input.address.city,
      address: input.address.line1,
    },
    metrics: {
      weight_grams: input.weight_total_grams,
      length_cm: input.length_cm,
      width_cm: input.width_cm,
      height_cm: input.height_cm,
    },
    declaredValue: input.declared_value_ars,
  }

  try {
    const res = await fetch(`${this.base}/rates/quote`, {
      method: "POST",
      headers: this.headers as any,
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Andreani quote ${res.status}`)
    const data: any = await res.json()

    const options: QuoteOption[] = (data?.services ?? []).map((svc: any) => ({
      carrier: "andreani",
      method_id: `andreani_${svc.code || "standard"}`,
      label: `Andreani ${svc.name || "Estándar"}`,
      service_level: /express/i.test(svc?.name) ? "express" : "standard",
      amount: Number(svc?.total) || 0,
      eta_min_days: Number(svc?.eta_min_days ?? 2),
      eta_max_days: Number(svc?.eta_max_days ?? 5),
      raw: svc,
    }))

    return options.length ? options : this.fallbackQuote(input)
  } catch (e) {
    return this.fallbackQuote(input)
  }
}

  async buyLabel(input: BuyLabelInput): Promise<BuyLabelResult> {
    if (!this.hasEnv) {
      // Fallback: simular etiqueta
      return {
        tracking_number: `SIM-${Date.now()}`,
        label_url: undefined,
        carrier: "andreani",
        service_level: input.option.service_level,
      }
    }

    const body = {
      contractNumber: this.contract,
      service: input.option.raw?.code ?? "standard",
      receiver: {
        name: input.address.full_name,
        phone: input.address.phone,
        address: {
          line1: input.address.line1,
          city: input.address.city,
          province: input.address.state,
          postalCode: input.address.postal_code,
          country: input.address.country,
        },
      },
      parcels: [
        {
          weight_grams: input.items.reduce((a, i) => a + (i.weight_grams ?? 500) * i.quantity, 0),
        },
      ],
      reference: input.order_id,
    }

    try {
      const res = await fetch(`${this.base}/shipments`, {
        method: "POST",
        headers: this.headers as any,
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`Andreani buyLabel ${res.status}`)
      const data: any = await res.json()

      return {
        tracking_number: data?.trackingNumber ?? data?.tracking ?? `AN-${Date.now()}`,
        label_url: data?.labelUrl ?? data?.label_url,
        carrier: "andreani",
        service_level: input.option.service_level,
        raw: data,
      }
    } catch (e) {
      // Si falla la compra de etiqueta, devolvé un tracking simulado para no romper el flujo
      return {
        tracking_number: `ERR-${Date.now()}`,
        label_url: undefined,
        carrier: "andreani",
        service_level: input.option.service_level,
        raw: { error: String(e) },
      }
    }
  }
}
