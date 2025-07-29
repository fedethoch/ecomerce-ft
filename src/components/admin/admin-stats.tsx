import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"

export function AdminStats() {
  const stats = [
    {
      title: "Ventas Totales",
      value: "$124,500",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Pedidos",
      value: "1,234",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Productos",
      value: "456",
      change: "+2.1%",
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Clientes",
      value: "2,345",
      change: "+15.3%",
      icon: Users,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stat.change}</span> desde el mes pasado
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
