"use server";

import { DashboardService } from "@/services/dashboard-services"
import { actionHandler } from "@/lib/handlers/actionHandler"
import { DashboardStatsResponse } from "@/types/dashboard/types"

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  return actionHandler(async () => {
    // Crear nueva instancia del servicio en cada ejecución
    const service = new DashboardService();
    return service.getDashboardStats();
  })
}