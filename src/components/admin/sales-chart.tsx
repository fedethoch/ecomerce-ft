"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SalesChart() {
  // Mock data for the chart
  const salesData = [
    { month: "Ene", sales: 45000 },
    { month: "Feb", sales: 52000 },
    { month: "Mar", sales: 48000 },
    { month: "Abr", sales: 61000 },
    { month: "May", sales: 55000 },
    { month: "Jun", sales: 67000 },
  ]

  const maxSales = Math.max(...salesData.map((d) => d.sales))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-end justify-between space-x-2">
          {salesData.map((data, index) => (
            <div key={data.month} className="flex flex-col items-center flex-1">
              <div
                className="w-full bg-primary rounded-t-md transition-all duration-1000 ease-out"
                style={{
                  height: `${(data.sales / maxSales) * 250}px`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{data.month}</p>
                <p className="text-xs text-muted-foreground">${(data.sales / 1000).toFixed(0)}k</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
