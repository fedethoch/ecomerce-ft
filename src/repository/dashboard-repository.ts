import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/types/dashboard/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export class DashboardRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = await this.getSupabase();
    
    // Total de productos
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    // Total de pedidos
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Total de clientes
    const { count: totalCustomers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Ventas totales
    const { data: salesData } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "Completado")

    const totalSales = salesData?.reduce((sum: number, order: any) => 
      sum + order.total_amount, 0) || 0

    // Pedidos recientes
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(`
        *,
        user:users(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalSales,
      recentOrders: recentOrders || [],
    }
  }
}