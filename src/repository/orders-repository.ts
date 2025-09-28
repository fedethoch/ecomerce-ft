import { createClient } from "@/lib/supabase/server"
import { Order, OrderItem, OrderWithDetails } from "@/types/orders/types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin-client"


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

  // NUEVOS MÉTODOS

  async createOrder(order: Partial<Order>): Promise<Order> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .insert(order)
      .select("*")
      .single();

    if (error) throw error;
    return data as Order;
  }

  async getOrderByExternalReference(external_reference: string): Promise<Order | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("external_reference", external_reference)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data as Order;
  }

  async updateOrder(order: Order): Promise<Order> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .update(order)
      .eq("id", order.id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Order;
  }

  async createOrderItem(orderItem: Partial<OrderItem>): Promise<OrderItem> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("order_items")
      .insert(orderItem)
      .select("*")
      .single();

    if (error) throw error;
    return data as OrderItem;
  }

    async updateOrderStatusAdmin(id: string, status: string): Promise<void> {
    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  }
}