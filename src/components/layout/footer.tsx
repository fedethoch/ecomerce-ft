import Link from "next/link"
import { Facebook, Instagram, Twitter, Shield, RotateCcw, Truck, Phone, Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#EDEBE6] border-t border-[#D6D3CD]">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand + Trust Badges */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-[#1E3A8A] rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-[#0B1220]">StyleHub</span>
            </div>
            <p className="text-[#4B5563] text-sm leading-relaxed">
              Tu tienda de moda favorita. Encuentra las últimas tendencias en ropa y accesorios.
            </p>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-[#0B1220]">
                <Shield className="h-4 w-4 text-[#1E3A8A]" />
                <span>Pago 100% seguro</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-[#0B1220]">
                <RotateCcw className="h-4 w-4 text-[#1E3A8A]" />
                <span>Devoluciones gratuitas</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-[#0B1220]">
                <Truck className="h-4 w-4 text-[#1E3A8A]" />
                <span>Envío gratis +$50</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Link href="#" className="text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1220]">Newsletter</h3>
            <p className="text-sm text-[#4B5563]">
              Suscríbete y obtén <span className="font-semibold text-[#8B1E3F]">15% OFF</span> en tu primera compra
            </p>
            <div className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Tu email"
                  className="flex-1 px-3 py-2 text-sm border border-[#D6D3CD] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-[#F6F5F0] text-[#0B1220]"
                />
                <button className="px-4 py-2 bg-[#1E3A8A] text-white text-sm font-medium rounded-r-md hover:bg-[#172C6F] transition-colors">
                  Suscribir
                </button>
              </div>
              <p className="text-xs text-[#4B5563]">
                Al suscribirte aceptas nuestra política de privacidad. Puedes cancelar en cualquier momento.
              </p>
            </div>
          </div>

          {/* Quick Help */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1220]">Ayuda Rápida</h3>
            <div className="space-y-3">
              <Link
                href="#"
                className="flex items-center space-x-2 text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
              >
                <Truck className="h-4 w-4" />
                <span>Información de envíos</span>
              </Link>
              <Link
                href="#"
                className="flex items-center space-x-2 text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Devoluciones</span>
              </Link>
              <Link href="#" className="text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors block">
                Guía de talles
              </Link>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>+1 234 567 890</span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center space-x-2 text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Carriers & Payments */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#0B1220]">Pagos & Envíos</h3>
            <div className="space-y-4">
              {/* Payment Methods */}
              <div>
                <p className="text-xs text-[#4B5563] mb-2">Métodos de pago</p>
                <div className="flex flex-wrap gap-2">
                  <div className="w-8 h-5 bg-[#F6F5F0] border border-[#D6D3CD] rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-[#1E3A8A]">V</span>
                  </div>
                  <div className="w-8 h-5 bg-[#F6F5F0] border border-[#D6D3CD] rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-[#8B1E3F]">M</span>
                  </div>
                  <div className="w-8 h-5 bg-[#F6F5F0] border border-[#D6D3CD] rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-[#1E3A8A]">P</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div>
                <p className="text-xs text-[#4B5563] mb-2">Envíos</p>
                <div className="flex flex-wrap gap-2">
                  <div className="px-2 py-1 bg-[#F6F5F0] border border-[#D6D3CD] rounded text-xs">DHL</div>
                  <div className="px-2 py-1 bg-[#F6F5F0] border border-[#D6D3CD] rounded text-xs">FedEx</div>
                </div>
              </div>

              {/* Track Order */}
              <Link
                href="#"
                className="inline-flex items-center space-x-2 text-sm text-[#1E3A8A] hover:text-[#172C6F] font-medium transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span>Rastrea tu pedido</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary Row */}
        <div className="border-t border-[#D6D3CD] pt-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Categories */}
            <div>
              <h4 className="font-medium text-[#0B1220] mb-3">Comprar</h4>
              <div className="space-y-2">
                <Link href="/productos" className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                  Todos los productos
                </Link>
                <Link
                  href="/productos?category=hombre"
                  className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
                >
                  Hombre
                </Link>
                <Link
                  href="/productos?category=mujer"
                  className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
                >
                  Mujer
                </Link>
                <Link
                  href="/productos?category=accesorios"
                  className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors"
                >
                  Accesorios
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-[#0B1220] mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                  Términos y condiciones
                </Link>
                <Link href="#" className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                  Política de privacidad
                </Link>
                <Link href="#" className="block text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                  Política de cookies
                </Link>
              </div>
            </div>

            {/* Cookie Preferences */}
            <div>
              <h4 className="font-medium text-[#0B1220] mb-3">Preferencias</h4>
              <button className="text-sm text-[#4B5563] hover:text-[#1E3A8A] transition-colors">
                Configurar cookies
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#D6D3CD] pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-[#4B5563]">&copy; 2024 StyleHub. Todos los derechos reservados.</p>

            {/* Language/Currency & Hours */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <select className="text-sm text-[#4B5563] bg-transparent border-none focus:outline-none cursor-pointer">
                  <option>ES - EUR</option>
                  <option>EN - USD</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 text-sm text-[#4B5563]">
                <Clock className="h-4 w-4" />
                <span>Lun-Vie 9:00-18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
