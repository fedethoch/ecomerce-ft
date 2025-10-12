"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const VerifyContent = () => {
  const supabase = createClient();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isManualVerifying, setIsManualVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Obtener email y enviar verificación automáticamente
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      // Enviar correo de verificación automáticamente
      const sendVerificationEmail = async () => {
        try {
          const { error } = await supabase.auth.signInWithOtp({
            email: emailParam,
            options: {
              emailRedirectTo: `https://ecomerce-ft.vercel.app/auth/callback`,
            },
          });

          if (error) {
            console.error("Error al enviar correo de verificación:", error);
            toast.error("Error al enviar el correo de verificación");
          } else {
            toast.success(
              "Correo de verificación enviado. Por favor revisa tu bandeja de entrada."
            );
          }
        } catch (error) {
          console.error("Error al enviar correo de verificación:", error);
          toast.error("Error al enviar el correo de verificación");
        }
      };

      sendVerificationEmail();
    }
  }, [searchParams]);

  // Función para verificación manual
  const handleManualVerify = async () => {
    if (!email) {
      toast.error("No se pudo obtener el email");
      return;
    }

    setIsManualVerifying(true);
    try {
      // Verificar el estado de autenticación
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      if (user?.email_confirmed_at) {
        setIsVerified(true);
        toast.success("¡Email verificado correctamente!");
      } else {
        toast.info(
          "Tu email aún no ha sido verificado. Por favor, haz clic en el enlace que te enviamos."
        );
      }
    } catch (error) {
      toast.error("Error al verificar el estado de tu cuenta");
      console.error("Error en verificación manual:", error);
    } finally {
      setIsManualVerifying(false);
    }
  };

  // Redirigir después de verificación exitosa
  useEffect(() => {
    if (isVerified) {
      setTimeout(() => router.push("/login"), 3000);
    }
  }, [isVerified, router]);

  // Función corregida para reenviar el correo de verificación
  const handleResendVerification = async () => {
    if (!email) {
      toast.error("No se pudo obtener el email");
      return;
    }

    setIsResending(true);
    try {
      // IMPORTANTE: Usar signInWithOtp para reenviar el correo de verificación
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `https://ecomerce-ft.vercel.app/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success(
        "¡Correo de verificación reenviado! Por favor revisa tu bandeja de entrada."
      );
    } catch (error: any) {
      toast.error(
        error.message || "Error al reenviar el correo. Inténtalo de nuevo."
      );
      console.error("Error en reenvío:", error);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-0">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">
                ¡Verificación exitosa!
              </h1>
              <p className="text-sm text-muted-foreground">
                Tu cuenta ha sido verificada correctamente. Ahora puedes acceder
                a todos los recursos de Edumine.
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Button asChild className="w-full bg-primary hover:bg-primary/90">
                <Link href="/login">Iniciar sesión</Link>
              </Button>

              <div className="text-center">
                <Link href="/" className="text-sm text-primary hover:underline">
                  Ir a la página principal
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border border-primary rounded-md">
        <CardHeader className="pb-0">
          <div className="mb-6">
            <Link
              href="/register"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Link>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Verifica tu cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Hemos enviado un enlace de verificación a <strong>{email}</strong>
              . Por favor, haz clic en ese enlace para verificar tu cuenta.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Botón de verificación manual */}
            <Button
              onClick={handleManualVerify}
              disabled={isManualVerifying}
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
            >
              {isManualVerifying ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verificando...
                </div>
              ) : (
                "Ya hice clic en el enlace, verificar ahora"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm">
                ¿No has recibido el correo? Revisa tu carpeta de spam o
              </p>
            </div>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full text-primary border-primary hover:bg-primary/10"
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Enviando...
                </div>
              ) : (
                "Reenviar correo de verificación"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-primary hover:underline">
              Ir a la página principal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
