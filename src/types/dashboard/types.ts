import { AppActionError } from "../types";

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalSales: number
  recentOrders: any[] // Reemplaza "any" con tu tipo Order si lo tienes
}

export type DashboardStatsResponse = DashboardStats | AppActionError;