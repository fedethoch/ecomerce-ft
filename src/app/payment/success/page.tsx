import Link from "next/link"
import { CheckCircle2, Package, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Payment() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4">
        <Card className="border-border/50 shadow-sm">
          <div className="p-8 md:p-12 text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-[#1E3A8A] p-3">
                <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">Pedido Confirmado</h1>
              <p className="text-muted text-sm md:text-base">Gracias por tu compra</p>
            </div>

            {/* Order Details */}
            <div className="pt-4 pb-2 space-y-4">
              <div className="flex items-start gap-3 text-left">
                <Package className="w-5 h-5 text-[#8B1E3F] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Tu pedido está en camino</p>
                  <p className="text-xs text-muted">Recibirás tu paquete en 3-5 días hábiles</p>
                </div>
              </div>

              <div className="flex items-start gap-3 text-left">
                <Mail className="w-5 h-5 text-[#8B1E3F] mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Confirmación enviada</p>
                  <p className="text-xs text-muted">Revisa tu correo para más detalles</p>
                </div>
              </div>
            </div>

            {/* Order Number */}
            <div className="pt-4 pb-2">
              <div className="inline-block px-4 py-2 bg-[#D6C6B2]/30 rounded-md">
                <p className="text-xs text-muted uppercase tracking-wider mb-1">Número de pedido</p>
                <p className="text-sm font-medium text-foreground tracking-wide">
                  #ORD-2024-{Math.floor(Math.random() * 10000)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-3">
              <Button asChild className="w-full bg-[#1E3A8A] hover:bg-[#172C6F] text-white">
                <Link href="/orders">Ver Mi Pedido</Link>
              </Button>

              <Button asChild variant="outline" className="w-full border-border hover:bg-accent/20 bg-transparent">
                <Link href="/">Seguir Comprando</Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted mt-6">
          ¿Necesitas ayuda?{" "}
          <Link href="/contact" className="text-[#8B1E3F] hover:underline">
            Contáctanos
          </Link>
        </p>
      </div>
    </main>
  )
}
