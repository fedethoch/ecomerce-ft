import { DashboardRepository } from "@/repository/dashboard-repository"
import { DashboardStats } from "@/types/dashboard/types"

export class DashboardService {
  private repository = new DashboardRepository()

  async getDashboardStats(): Promise<DashboardStats> {
    return this.repository.getDashboardStats()
  }
}