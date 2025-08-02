import { createClient } from "@/lib/supabase/client"
import { DashboardStats } from "@/types/dashboard/types"

export class DashboardRepository {
  private supabase = createClient()

  async getDashboardStats(): Promise<DashboardStats> {
    // Total de productos
    const { count: totalProducts } = await this.supabase
      .from("products")
      .select("*", { count: "exact", head: true })

    // Total de pedidos
    const { count: totalOrders } = await this.supabase
      .from("orders")
      .select("*", { count: "exact", head: true })

    // Total de clientes
    const { count: totalCustomers } = await this.supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Ventas totales
    const { data: salesData } = await this.supabase
      .from("orders")
      .select("total_amount")
      .eq("status", "Completado")

    const totalSales = salesData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Pedidos recientes
    const { data: recentOrders } = await this.supabase
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