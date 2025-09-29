import { ProductType } from "../products/products"
import { PublicUser } from "../types"

export interface Order {
  id: string
  user_id: string
  created_at: string
  total_amount: number
  status: string
  currency?: string
  payment_status?: string
  payment_provider?: string
  payment_intent_id?: string
  shipping_address_id?: string | null
  billing_address_id?: string | null
  shipping_method_id?: string | null
  shipping_status?: string | null
  user?: PublicUser
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  unit_price?: number | null
  currency?: string | null
  product_name?: string | null

}

export interface OrderWithDetails extends Order {
  order_items: (OrderItem & { product: ProductType })[]
  user: PublicUser
}
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "charged_back";
export type OrderLifecycleStatus = "pending" | "success" | "cancelled" | "flagged";
export type OrderStatus = "Completado" | "Procesando" | "Enviado" | "Pendiente"