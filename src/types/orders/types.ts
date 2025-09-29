import { ProductType } from "../products/products"
import { PublicUser } from "../types"

export interface Order {
  id: string
  user_id: string
  created_at: string
  total_amount: number
  status: string
  user?: PublicUser
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  unit_price?: number | null
  product_name?: string | null
  currency?: string | null
  created_at?: string
  product?: ProductType
}

export interface OrderWithDetails extends Order {
  order_items: (OrderItem & { product: ProductType })[]
  user: PublicUser
}

export type OrderStatus = "Completado" | "Procesando" | "Enviado" | "Pendiente"