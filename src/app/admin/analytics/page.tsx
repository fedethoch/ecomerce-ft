import { TrendingUp, DollarSign, Users, Package, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/admin/metric-card"

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Analiza el rendimiento de tu tienda</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Conversión" value="3.2%" change="+0.5% desde el mes pasado" icon={TrendingUp} />
        <MetricCard title="Ticket Promedio" value="$89.50" change="+12% desde el mes pasado" icon={DollarSign} />
        <MetricCard title="Visitantes" value="12,234" change="+8% desde el mes pasado" icon={Users} />
        <MetricCard
          title="Productos Más Vendidos"
          value="Camisetas"
          change="45% de las ventas totales"
          icon={Package}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-2" />
              <span className="ml-2">Gráfico de categorías aquí</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mb-2" />
              <span className="ml-2">Gráfico de tendencias aquí</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
