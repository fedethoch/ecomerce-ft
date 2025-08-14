"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { LogOut, Package, MapPin } from 'lucide-react'
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login"); // Redirect to login if not authenticated
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/login"); // Redirect if user logs out
      } else {
        setUser(session.user);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/"); // Redirect to home after logout
    } else {
      console.error("Error logging out:", error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Should redirect to login, but as a fallback
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg?height=96&width=96&query=user profile avatar"} alt="Avatar de usuario" />
              <AvatarFallback>{user.email ? user.email[0].toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold">Mi Perfil</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Gestiona la información de tu cuenta y tus pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" value={user.email} readOnly className="bg-muted" />
            </div>
            {/* You can add more user details here if available in user_metadata */}
            {/* For example, if you store a name: */}
            {/* {user.user_metadata?.full_name && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" type="text" value={user.user_metadata.full_name} readOnly className="bg-muted" />
              </div>
            )} */}
            <Button onClick={handleLogout} className="w-full" variant="destructive" disabled={loading}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Historial de Pedidos
            </CardTitle>
            <CardDescription>
              Consulta el estado de tus pedidos anteriores y actuales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>Aún no tienes pedidos. ¡Explora nuestros productos!</p>
              <Button asChild className="mt-4">
                <Link href="/productos">Ir a Productos</Link>
              </Button>
            </div>
            {/* Here you would map through actual order data */}
            {/* Example of an order item:
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-semibold">Pedido #12345</h3>
              <p className="text-sm text-muted-foreground">Fecha: 15/07/2024</p>
              <p className="text-sm text-muted-foreground">Total: $99.99</p>
              <p className="text-sm text-muted-foreground">Estado: Entregado</p>
              <Button variant="link" className="p-0 h-auto">Ver detalles</Button>
            </div>
            */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Direcciones de Envío
            </CardTitle>
            <CardDescription>
              Gestiona tus direcciones para un proceso de compra más rápido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              <p>No tienes direcciones guardadas. Añade una para futuras compras.</p>
              <Button className="mt-4">Añadir Nueva Dirección</Button>
            </div>
            {/* Here you would map through actual address data */}
            {/* Example of an address item:
            <div className="border rounded-md p-4 mb-4">
              <h3 className="font-semibold">Casa</h3>
              <p className="text-sm">Calle Falsa 123, Ciudad, País</p>
              <Button variant="link" className="p-0 h-auto mr-2">Editar</Button>
              <Button variant="link" className="p-0 h-auto text-destructive">Eliminar</Button>
            </div>
            */}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
