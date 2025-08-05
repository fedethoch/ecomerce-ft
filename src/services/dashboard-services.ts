import { DashboardRepository } from "@/repository/dashboard-repository"
import { DashboardStats } from "@/types/dashboard/types"

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    // Crear instancia del repositorio solo cuando se necesite
    const repository = new DashboardRepository();
    return repository.getDashboardStats();
  }
}