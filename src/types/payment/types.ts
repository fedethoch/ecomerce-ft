import { CartItem } from "../cart/types"

export type CreatePreferenceValues = {
  items: CartItem[]
  payment_method: "mercadopago" | "paypal"
  //legacy:
  product_id?: string
  quantity?: number
  address?: AddressDTO               // 👈 para calcular envío
  shipping_method_id?: string        // 👈 para identificar la opción elegida
}

export type CreatePreferenceResponse = {
  init_point: string
}

export type UpdatePreferenceValues = {
  external_reference: string
  payment_id: string
  collection_status:
    | "approved"
    | "in_process"
    | "authorized"
    | "rejected"
    | "cancelled"
    | "refunded"
    | "charged_back"
    | string
  // opcionales, los manda el webhook procesado:
  paid_amount?: number
  raw_topic?: string
}

export type FinalizePayPalValues = {
  token: string // PayPal devuelve ?token=ORDER_ID en return_url
}

export type AddressDTO = {
  full_name?: string
  line1: string
  city: string
  state: string
  postal_code: string
  country: "AR"
  phone?: string
}