// app/(auth)/update-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // 0 = Verificando, 1 = Verificado, 2 = Error/Inválido
  const [verificationState, setVerificationState] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();

  // --- MODIFICACIÓN AQUÍ ---
  // Hemos simplificado el useEffect para que SÓLO
  // escuche el evento PASSWORD_RECOVERY
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          setVerificationState(1); // ¡Verificado! Mostramos el formulario.
        }
      }
    );

    // Timeout por si el enlace es inválido y el evento nunca se dispara
    const timer = setTimeout(() => {
      if (verificationState === 0) {
        setVerificationState(2); // Marcamos como error
        setError("Enlace inválido o expirado. Por favor, solicita uno nuevo.");
      }
    }, 5000); // 5 segundos de espera

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router]);
  // --- FIN DE LA MODIFICACIÓN ---


  // Paso 2: Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validaciones
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (updateError) {
      setError("Error al actualizar la contraseña. Inténtalo de nuevo.");
      console.error("Error update password:", updateError.message);
    } else {
      setMessage("¡Contraseña actualizada con éxito!");
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  // --- (El resto del archivo es idéntico) ---

  // Estado 0: Verificando el enlace
  if (verificationState === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-medium">Verificando enlace...</h1>
        <p className="text-muted-foreground">
          Esto tomará solo un segundo.
        </p>
      </div>
    );
  }

  // Estado 2: Enlace inválido o expirado
  if (verificationState === 2) {
    return (
       <div className="flex items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md border border-destructive rounded-md">
           <CardHeader>
            <div className="space-y-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h1 className="text-2xl font-bold tracking-tight text-destructive">
                Enlace Inválido
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {error}
              </p>
            </div>
           </CardHeader>
           <CardContent>
             <Button
                asChild
                variant="outline"
                className="w-full"
              >
              {/* Apuntamos a la ruta correcta sin (auth) */}
              <Link href="/recover-password">
                Solicitar nuevo enlace
              </Link>
             </Button>
           </CardContent>
        </Card>
       </div>
    );
  }

  // Estado 1: Verificado, mostrar formulario
  return (
    <div className="flex items-center justify-center h-screen p-4">
      <Card className="w-full max-w-md border border-primary rounded-md">
        <CardHeader className="pb-0">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Crea tu nueva contraseña
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu enlace fue verificado. Por favor, ingresa tu nueva contraseña.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Mensajes de éxito o error */}
            {message && (
              <p className="text-sm text-center font-medium text-green-600 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" /> {message}
              </p>
            )}
            {error && (
              <p className="text-sm text-center font-medium text-destructive flex items-center justify-center gap-2">
                 <AlertTriangle className="h-4 w-4" /> {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={loading || !!message} // Deshabilitado si está cargando o si ya tuvo éxito
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Guardar nueva contraseña"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿Recordaste tu contraseña? </span>
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}