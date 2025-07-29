"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, User, Menu, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Navbar() {
  const [cartItems] = useState(3) // Mock cart items

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl">StyleHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/productos" className="text-sm font-medium hover:text-primary transition-colors">
              Productos
            </Link>
            <Link
              href="/productos?category=hombre"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Hombre
            </Link>
            <Link href="/productos?category=mujer" className="text-sm font-medium hover:text-primary transition-colors">
              Mujer
            </Link>
            <Link
              href="/productos?category=accesorios"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Accesorios
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-sm mx-8">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar productos..." className="pl-8" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItems}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/productos" className="text-lg font-medium">
                    Productos
                  </Link>
                  <Link href="/productos?category=hombre" className="text-lg font-medium">
                    Hombre
                  </Link>
                  <Link href="/productos?category=mujer" className="text-lg font-medium">
                    Mujer
                  </Link>
                  <Link href="/productos?category=accesorios" className="text-lg font-medium">
                    Accesorios
                  </Link>
                  <div className="pt-4 border-t">
                    <Button className="w-full mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Mi Cuenta
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
