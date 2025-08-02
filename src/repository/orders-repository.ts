import { createClient } from "@/lib/supabase/client"
import { Order, OrderWithDetails } from "@/types/orders/types"

export class OrdersRepository {
  private supabase = createClient()

  async getOrders() {
    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        user:users(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data as OrderWithDetails[]
  }

  async getOrder(id: string) {
    const { data, error } = await this.supabase
      .from("orders")
      .select(`
        *,
        user:users(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data as OrderWithDetails
  }

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await this.supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Order
  }
}