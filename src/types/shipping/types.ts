// types/shipping.ts
export type AddressInput = {
  full_name: string
  phone?: string
  line1: string
  line2?: string
  city: string
  state: string           // provincia
  postal_code: string     // CPA o 4 dígitos
  country: "AR"
}

export type ShippingOption = {
  method_id: string
  label: string
  provider?: string
  service_level: "standard" | "express" | "pickup"
  amount: number          // ARS
  eta_min_days: number
  eta_max_days: number
}

export type CartItemForShipping = {
  product_id: string
  quantity: number
  weight_grams?: number   // si no viene, se busca en DB
  // opcional dims
}

export type OrderAddress = AddressInput & {
  order_id: string
}

export type Shipment = {
  id: string
  order_id: string
  carrier: string
  service_level?: string
  tracking_number: string
  label_url?: string
  status: string            // 'label_pending' | 'ready' | 'in_transit' | ...
  amount_customer: number
  created_at: string
}