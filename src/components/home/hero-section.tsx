import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/placeholder.svg?height=800&width=1200"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Descubre tu
            <span className="block text-primary">Estilo Único</span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Explora nuestra colección de moda contemporánea. Encuentra piezas únicas que reflejen tu personalidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/productos">Explorar Colección</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Link href="/productos?category=nuevos">Ver Novedades</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
