import { createClient } from "@/lib/supabase/server"
import { OrderWithDetails } from "@/types/orders/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export class OrdersRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  async getOrders(): Promise<OrderWithDetails[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
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

    if (error) throw error;
    return data as OrderWithDetails[];
  }

  async getOrder(id: string): Promise<OrderWithDetails> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
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

    if (error) throw error;
    return data as OrderWithDetails;
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderWithDetails> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select(`
        *,
        user:users(*),
        order_items(
          *,
          product:products(*)
        )
      `)
      .single()

    if (error) throw error;
    return data as OrderWithDetails;
  }
}