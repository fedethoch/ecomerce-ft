export type QuoteInput = {
  // 🔹 Origen del envío (tu depósito/sucursal)
  origin: {
    postal_code: string
    province: string
    city: string
    address_line1: string
  }

  // 🔹 Destino
  address: {
    full_name?: string
    phone?: string
    line1: string
    city: string
    state: string
    postal_code: string
    country: "AR"
  }

  // 🔹 Ítems del paquete
  items: { product_id: string; quantity: number; weight_grams?: number; length_cm?: number; width_cm?: number; height_cm?: number }[]

  // 🔹 Métricas agregadas
  weight_total_grams?: number
  length_cm?: number
  width_cm?: number
  height_cm?: number

  // 🔹 Valor declarado (para seguro)
  declared_value_ars?: number
}

export type QuoteOption = {
  carrier: "andreani" | "oca" | "correo" | "moova" | string
  method_id: string
  label: string
  service_level: "standard" | "express" | "pickup"
  amount: number
  eta_min_days: number
  eta_max_days: number
  raw?: any
}

export type BuyLabelInput = {
  order_id: string
  address: QuoteInput["address"]
  option: QuoteOption           // opción elegida en el checkout
  items: { product_id: string; quantity: number; weight_grams?: number }[]
}

export type BuyLabelResult = {
  tracking_number: string
  label_url?: string
  carrier: string
  service_level: string
  raw?: any
}

export interface ICarrierProvider {
  quote(input: QuoteInput): Promise<QuoteOption[]>
  buyLabel(input: BuyLabelInput): Promise<BuyLabelResult>
}
