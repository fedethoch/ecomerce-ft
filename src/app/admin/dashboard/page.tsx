"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/admin/metric-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useAdminLayout } from "@/context/layout-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardView() {
  const { stats, loading, error } = useDashboardStats();
  const { open } = useAdminLayout();
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>

        {/* Skeleton para las métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-[120px]" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-7 w-[80px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-[140px] mt-3" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton para los gráficos */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[140px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-destructive">{error}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="text-lg font-medium">
              Error al cargar los datos del dashboard
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manejar caso donde stats es null/undefined
  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="text-lg font-medium">
                No se encontraron datos del dashboard
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
