"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { useAdminLayout } from "@/context/layout-context";
import { useOrders } from "@/hooks/use-orders";
import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, Package, TrendingUp, Users } from "lucide-react";

// Mock data for charts
const salesByCategory = [
  { name: "Camisetas", value: 45, sales: 2340 },
  { name: "Pantalones", value: 25, sales: 1300 },
  { name: "Zapatos", value: 20, sales: 1040 },
  { name: "Accesorios", value: 10, sales: 520 },
];

const salesTrend = [
  { month: "Ene", sales: 4000, orders: 240 },
  { month: "Feb", sales: 3000, orders: 180 },
  { month: "Mar", sales: 5000, orders: 300 },
  { month: "Abr", sales: 4500, orders: 270 },
  { month: "May", sales: 6000, orders: 360 },
  { month: "Jun", sales: 5500, orders: 330 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function AnalyticsView() {
  const { open } = useAdminLayout();
  const { orders, loading, error, updateStatus } = useOrders();
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>(
    {}
  );

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: true }));
      await updateStatus(orderId, newStatus);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    } finally {
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <div
      className={`space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8 transition-all duration-300 ${open ? "lg:ml-64" : "lg:ml-16"}`}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Analiza el rendimiento de tu tienda
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Conversión"
          value="3.2%"
          change="+0.5% desde el mes pasado"
          icon={TrendingUp}
        />
        <MetricCard
          title="Ticket Promedio"
          value="$89.50"
          change="+12% desde el mes pasado"
          icon={DollarSign}
        />
        <MetricCard
          title="Visitantes"
          value="12,234"
          change="+8% desde el mes pasado"
          icon={Users}
        />
        <MetricCard
          title="Productos Más Vendidos"
          value="Camisetas"
          change="45% de las ventas totales"
          icon={Package}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "sales" ? `$${value}` : value,
                      name === "sales" ? "Ventas" : "Órdenes",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ fill: "#82ca9d" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
