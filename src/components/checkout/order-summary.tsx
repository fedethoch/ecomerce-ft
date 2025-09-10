import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export function OrderSummary() {
  // Mock cart items
  const cartItems = [
    {
      id: "1",
      name: "Camiseta Básica Blanca",
      price: 25000,
      quantity: 2,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: "2",
      name: "Jeans Slim Fit",
      price: 45000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 5000;
  const total = subtotal + shipping;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Resumen del Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                Cantidad: {item.quantity}
              </p>
            </div>
            <span className="font-medium">
              ${(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span>${shipping.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
