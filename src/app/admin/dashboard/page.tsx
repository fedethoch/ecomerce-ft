"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MetricCard } from "@/components/admin/metric-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useAdminLayout } from "@/context/layout-context";


export default function DashboardView() {
  const { stats, loading, error } = useDashboardStats();
  const { open } = useAdminLayout();
  if (loading) {
    return (
      <div className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  // Manejar caso donde stats es null/undefined
  if (!stats) {
    return (
      <div className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-destructive">
            No se encontraron datos del dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-8 transition-all duration-300 ${open ? "ml-64" : "ml-16"}`}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de tu tienda de ropa
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ventas Totales"
          value={`$${stats.totalSales?.toFixed(2) || "0.00"}`}
          change="+20.1% desde el mes pasado"
          icon={DollarSign}
        />
        <MetricCard
          title="Pedidos"
          value={stats.totalOrders?.toString() || "0"}
          change="+180.1% desde el mes pasado"
          icon={ShoppingCart}
        />
        <MetricCard
          title="Productos"
          value={stats.totalProducts?.toString() || "0"}
          change="+19% desde el mes pasado"
          icon={Package}
        />
        <MetricCard
          title="Clientes Activos"
          value={stats.totalCustomers?.toString() || "0"}
          change="+201 desde el mes pasado"
          icon={Users}
        />
      </div>

      {/* Gráficos y tablas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas Recientes</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-2" />
              <span className="ml-2">Gráfico de ventas aquí</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Tienes {stats.totalOrders || 0} pedidos en total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {(stats.recentOrders || []).slice(0, 3).map((order: any) => (
                <div key={order.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {order.user?.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.user?.name || "Usuario"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      #{order.id?.slice(0, 8) || "N/A"}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    ${order.total_amount?.toFixed(2) || "0.00"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
