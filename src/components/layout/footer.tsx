import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between space-y-8 md:space-y-0">
          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">StyleHub</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Tu tienda de moda favorita. Encuentra las últimas tendencias en ropa y accesorios.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-16">
            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold">Comprar</h3>
              <Link href="/productos" className="text-muted-foreground hover:text-primary transition-colors">
                Todos los productos
              </Link>
              <Link
                href="/productos?category=hombre"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Hombre
              </Link>
              <Link
                href="/productos?category=mujer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Mujer
              </Link>
              <Link
                href="/productos?category=accesorios"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Accesorios
              </Link>
            </div>

            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold">Ayuda</h3>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Contacto
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Envíos
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Devoluciones
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Guía de talles
              </Link>
            </div>

            <div className="flex flex-col space-y-3">
              <h3 className="font-semibold">Legal</h3>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Términos y condiciones
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Política de privacidad
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 StyleHub. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
