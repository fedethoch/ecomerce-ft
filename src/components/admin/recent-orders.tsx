import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function RecentOrders() {
  const orders = [
    {
      id: "ORD-001",
      customer: "María García",
      total: 75000,
      status: "completed",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      customer: "Juan Pérez",
      total: 45000,
      status: "processing",
      date: "2024-01-15",
    },
    {
      id: "ORD-003",
      customer: "Ana López",
      total: 120000,
      status: "shipped",
      date: "2024-01-14",
    },
    {
      id: "ORD-004",
      customer: "Carlos Ruiz",
      total: 35000,
      status: "pending",
      date: "2024-01-14",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "processing":
        return "Procesando"
      case "shipped":
        return "Enviado"
      case "pending":
        return "Pendiente"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.customer}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${order.total.toLocaleString()}</p>
                <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
