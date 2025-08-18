import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function CategorySection() {
  const categories = [
    {
      name: "Hombre",
      href: "/productos?category=hombre",
      image: "/men-category.jpg",
      description: "Estilo masculino contemporáneo",
    },
    {
      name: "Mujer",
      href: "/productos?category=mujer",
      image: "/women-category.jpg",
      description: "Elegancia y sofisticación",
    },
    {
      name: "Niño/a",
      href: "/productos?category=nino",
      image: "/children-category.jpg",
      description: "Moda infantil divertida y cómoda",
    },
  ]

  return (
    <section className="w-full bg-background">
      <div className="w-full">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 h-screen">
          {categories.map((category) => (
            <li
              key={category.name}
              className="group bg-card text-foreground transition-all duration-300 hover:shadow-lg relative"
            >
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width:1536px) 720px,
                         (min-width:1280px) 600px,
                         (min-width:1024px) 520px,
                         (min-width:640px) 400px,
                         100vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <h3 className="mb-2 text-2xl font-bold text-white">{category.name}</h3>
                  <p className="mb-4 text-white/90">{category.description}</p>
                  <Button
                    asChild
                    className="w-full max-w-xs bg-white text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Link href={category.href}>Explorar {category.name}</Link>
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
