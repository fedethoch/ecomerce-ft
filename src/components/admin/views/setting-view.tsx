import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Configura tu tienda y preferencias</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Tienda</CardTitle>
            <CardDescription>Actualiza los detalles básicos de tu tienda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nombre de la Tienda</Label>
                <Input id="store-name" defaultValue="Fashion Store" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-email">Email</Label>
                <Input id="store-email" defaultValue="admin@fashionstore.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-description">Descripción</Label>
              <Textarea id="store-description" defaultValue="Tu tienda de ropa favorita" className="min-h-[100px]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Pagos</CardTitle>
            <CardDescription>Gestiona los métodos de pago aceptados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarjetas de Crédito</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PayPal</p>
                  <p className="text-sm text-muted-foreground">Pagos seguros con PayPal</p>
                </div>
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Envíos</CardTitle>
            <CardDescription>Configura las opciones de envío</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-cost">Costo de Envío</Label>
                  <Input id="shipping-cost" defaultValue="5.99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free-shipping">Envío Gratis Desde</Label>
                  <Input id="free-shipping" defaultValue="50.00" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>Guardar Cambios</Button>
      </div>
    </div>
  )
}
