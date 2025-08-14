import { CartItem } from "../cart/types"

export type CreatePreferenceValues = {
  items: CartItem[]
  payment_method: "mercadopago" | "paypal"
  //legacy:
  product_id?: string
  quantity?: number
}

export type CreatePreferenceResponse = {
  init_point: string
}

export type UpdatePreferenceValues = {
  external_reference: string
  payment_id: string
  collection_status: "approved" | "in_process" | "rejected" | "refunded" | "charged_back" | string
}