"use client"; // <--- 1. Convertido a Cliente

import { useState } from "react"; // <--- 2. Importar hooks
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react"; // <--- 3. Icono de carga
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client"; // <--- 4. Cliente Supabase

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    
    // 5. Definimos a dónde debe volver el usuario DESPUÉS de hacer clic
    // en el enlace de su correo.
    // ¡DEBES CREAR ESTA PÁGINA! (Ej: /auth/update-password)
    const redirectUrl = `${window.location.origin}/auth/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    setLoading(false);

    if (error) {
      setError(
        "Error: No se pudo enviar el correo. ¿Es la dirección correcta?"
      );
      console.error("Error reset password:", error.message);
    } else {
      setMessage("¡Correo enviado! Revisa tu bandeja de entrada.");
    }
  };

  return (
    // --- 6. SOLUCIÓN DE CENTRADO ---
    // Cambiamos min-h-screen por h-screen para evitar el scroll
    <div className="flex items-center justify-center h-screen p-4">
      <Card className="w-full max-w-md border border-primary rounded-md">
        <CardHeader className="pb-0">
          <div className="mb-6">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Link>
          </div>
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Recuperar contraseña
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Completa el formulario para recibir un enlace de recuperación de
              contraseña.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* --- 7. LÓGICA DEL FORMULARIO --- */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Mensajes de éxito o error */}
            {message && (
              <p className="text-sm text-center font-medium text-green-600">
                {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-center font-medium text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Enviar enlace de recuperación"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              ¿Recordaste tu contraseña?{" "}
            </span>
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}