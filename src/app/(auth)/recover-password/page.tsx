"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react"; // Importa AlertTriangle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// --- MODIFICACIÓN 1: Importar la Server Action ---
import { handlePasswordResetRequest } from "../auth-actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // --- MODIFICACIÓN 2: Lógica de handleSubmit actualizada ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // La URL de redirección (sin /auth/)
    const redirectUrl = `${window.location.origin}/update-password`;

    // Llamamos a nuestra nueva Server Action
    const result = await handlePasswordResetRequest(email, redirectUrl);

    setLoading(false);

    if (result.success) {
      setMessage(result.message || "¡Correo enviado!");
    } else {
      // Manejamos el error específico de cuenta de Google
      if (result.error === "google_account") {
        setError(
          result.message || "Esta cuenta usa Google. Inicia sesión con Google."
        );
      } else {
        setError(
          "Error: No se pudo enviar el correo. ¿Es la dirección correcta?"
        );
      }
      console.error("Error reset password:", result.error);
    }
  };
  // --- FIN DE LA MODIFICACIÓN ---

  return (
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
              // --- MODIFICACIÓN 3: Mostrar mejor el error de Google ---
              <p className="text-sm text-center font-medium text-destructive flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span className="text-left">{error}</span>
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