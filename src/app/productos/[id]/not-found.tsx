import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 bg-muted/30 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground/50" />
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute bottom-8 left-8 w-6 h-6 bg-secondary/20 rounded-full animate-pulse delay-300" />
        </div>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold">Producto no encontrado</h1>
          <p className="text-muted-foreground text-lg">
            Lo sentimos, el producto que buscas no existe o ha sido eliminado de nuestro catálogo.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/productos">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Ver Todos los Productos
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
