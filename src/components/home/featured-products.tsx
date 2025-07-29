import { ProductCard } from "@/components/ui/product-card"
import { Button } from "@/components/ui/button"
import { mockProducts } from "@/lib/mock-data"
import Link from "next/link"

export function FeaturedProducts() {
  const featuredProducts = mockProducts.slice(0, 8)

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Productos Destacados</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubre nuestra selección especial de piezas que están marcando tendencia
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
