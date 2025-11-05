import { createClient } from "@/lib/supabase/server"
import { Order, OrderItem, OrderWithDetails } from "@/types/orders/types"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin-client"

// 👇 importa los tipos de shipping
import type { OrderAddress, Shipment } from "@/types/shipping/types"

export class OrdersRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  // --- (MODIFICACIÓN: Nueva función de eliminar) ---
  async deleteOrder(id: string): Promise<Order> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id)
      .select()
      .single() // Devuelve el objeto eliminado

    if (error) throw error;
    return data as Order;
  }
  // --- (FIN DE LA MODIFICACIÓN) ---


  async getOrders(): Promise<OrderWithDetails[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        user:users(*),
        order_items(*, product:products(*))
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
        order_items(*, product:products(*))
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
      .update({ status }) // <-- Esto ya es genérico, ¡perfecto!
      .eq("id", id)
      .select(`
        *,
        user:users(*),
        order_items(*, product:products(*))
      `)
      .single()

    if (error) throw error;
    return data as OrderWithDetails;
  }

  // ========= EXISTENTES =========
  // ... (el resto de tu archivo no necesita cambios) ...

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
      // PGRST116 = no rows returned
      if ((error as any).code === "PGRST116") return null;
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

  // ========= NUEVOS PARA ENVÍOS =========

  // Crea/actualiza la dirección asociada a la orden
  async createOrderAddress(addr: { order_id: string } & OrderAddress): Promise<OrderAddress> {
    const supabase = await this.getSupabase();
    // upsert por order_id (una sola dirección por orden)
    const { data, error } = await supabase
      .from("order_addresses")
      .upsert(
        {
          order_id: addr.order_id,
          full_name: addr.full_name ?? null,
          line1: addr.line1,
          city: addr.city,
          state: addr.state,
          postal_code: addr.postal_code,
          country: addr.country,
          phone: addr.phone ?? null,
        },
        { onConflict: "order_id" }
      )
      .select("*")
      .single();

    if (error) throw error;
    return data as OrderAddress;
  }

  // Devuelve la dirección guardada para una orden (o null si no existe)
  async getOrderAddress(order_id: string): Promise<OrderAddress | null> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("order_addresses")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (error) {
      if ((error as any).code === "PGRST116") return null;
      throw error;
    }
    return data as OrderAddress;
  }

  // Registra un envío/etiqueta
  async createShipment(input: {
    order_id: string
    carrier: string
    service_level?: string
    tracking_number: string
    label_url?: string
    amount_customer: number
    status?: string
  }): Promise<Shipment> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("shipments")
      .insert({
        order_id: input.order_id,
        carrier: input.carrier,
        service_level: input.service_level ?? null,
        tracking_number: input.tracking_number,
        label_url: input.label_url ?? null,
        amount_customer: input.amount_customer,
        status: input.status ?? "label_pending",
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Shipment;
  }

  async getOrderAdmin(id: string): Promise<OrderWithDetails> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")     
      .select(`
        *,
        user:users(*),
        order_items(
          * ,
          product:products(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return (data as OrderWithDetails) ?? null
  }

  async updateOrderAdmin(order: Order): Promise<Order> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("orders")
      .update(order)
      .eq("id", order.id)
      .select("*")
      .single()

    if (error) throw error
    return data as Order
  }

  async getOrderAddressAdmin(order_id: string): Promise<OrderAddress | null> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("order_addresses") // ⚠️ cambia el nombre si tu tabla es otra
      .select("*")
      .eq("order_id", order_id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return (data as OrderAddress) ?? null
  }

  async updateOrderFieldsAdmin(id: string, patch: Partial<Order>): Promise<Order> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw error
    return data as Order
  }
}