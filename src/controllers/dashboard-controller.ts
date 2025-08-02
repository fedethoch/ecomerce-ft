import { DashboardService } from "@/services/dashboard-services"
import { actionHandler } from "@/lib/handlers/actionHandler"
import { DashboardStatsResponse } from "@/types/dashboard/types"

const service = new DashboardService()

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  return actionHandler(async () => {
    return service.getDashboardStats()
  })
}