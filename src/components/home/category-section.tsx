import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function CategorySection() {
  const categories = [
    {
      name: "Hombre",
      href: "/productos?category=hombre",
      image: "/placeholder.svg?height=400&width=300",
      description: "Estilo masculino contemporáneo",
    },
    {
      name: "Mujer",
      href: "/productos?category=mujer",
      image: "/placeholder.svg?height=400&width=300",
      description: "Elegancia y sofisticación",
    },
    {
      name: "Accesorios",
      href: "/productos?category=accesorios",
      image: "/placeholder.svg?height=400&width=300",
      description: "Complementa tu look",
    },
  ]

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explora por Categoría</h2>
          <p className="text-muted-foreground text-lg">Encuentra exactamente lo que buscas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="aspect-[3/4] overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={300}
                  height={400}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-muted-foreground mb-4">{category.description}</p>
                <Button asChild className="w-full">
                  <Link href={category.href}>Explorar {category.name}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
