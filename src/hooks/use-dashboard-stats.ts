import { useState, useEffect } from "react"
import { getDashboardStats } from "@/controllers/dashboard-controller"
import { DashboardStats, DashboardStatsResponse } from "@/types/dashboard/types"
import { isAppActionError } from "@/lib/guards"

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await getDashboardStats()
        
        if (isAppActionError(response)) {
          setError(response.userMessage || "Error al cargar estadísticas")
        } else {
          setStats(response)
        }
      } catch (err) {
        setError("Error inesperado al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}