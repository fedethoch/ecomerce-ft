import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

interface OrderConfirmationProps {
  orderData: any
}

export function OrderConfirmation({ orderData }: OrderConfirmationProps) {
  const orderNumber = `ORD-${Date.now()}`

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">Tu pedido ha sido procesado exitosamente.</p>
        <div className="bg-muted p-4 rounded-lg">
          <p className="font-medium">Número de pedido</p>
          <p className="text-lg font-bold">{orderNumber}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Recibirás un email de confirmación con los detalles de tu pedido y el seguimiento del envío.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild className="flex-1">
            <Link href="/productos">Seguir Comprando</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
