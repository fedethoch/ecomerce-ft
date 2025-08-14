"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, User, Menu, Search, LogOut } from 'lucide-react' // Added LogOut icon for logged-in state
import { Input } from "@/components/ui/input"
import { useCart } from "@/context/cart-context";
import Cart from "@/components/cart/Cart";
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function Navbar() {
  const router = useRouter();
  const { cart, setIsOpen, isOpen } = useCart();
  const [cartItems] = useState(cart.length)

  // Estado para el usuario autenticado
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    // Obtiene el usuario actual
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
    // Escucha cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/"); // Redirect to home after logout
  };

  return (
    <>
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
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32&query=user profile avatar"} alt={user.email || "User"} />
                      <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.push("/register")}>
                  <User className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">
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
                      {user ? (
                        <>
                          <Button className="w-full mb-2" onClick={() => router.push("/profile")}>
                            <User className="w-4 h-4 mr-2" />
                            Mi Perfil
                          </Button>
                          <Button className="w-full" variant="outline" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesión
                          </Button>
                        </>
                      ) : (
                        <Button className="w-full mb-2" onClick={() => router.push("/register")}>
                          <User className="w-4 h-4 mr-2" />
                          Registrarse
                        </Button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <Cart />
    </>
  )
}
