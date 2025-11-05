// app/(auth)/verify/page.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"; // <-- Componente clave
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VerifyOtpPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");

  // 1. Leer el email de la URL
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    } else {
      // Si no hay email, no podemos verificar. Enviar al login.
      toast.error("Email no encontrado. Por favor, inicia el proceso de nuevo.");
      router.push("/login");
    }
  }, [searchParams, router]);

  // 2. Manejar el envío del código
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || otp.length !== 6) {
      toast.error("Por favor, ingresa un código de 6 dígitos.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    setIsLoading(false);

    if (error) {
      toast.error(
        error.message.includes("expired")
          ? "El código ha expirado. Por favor, solicita uno nuevo."
          : "Código incorrecto. Inténtalo de nuevo."
      );
    } else {
      // ¡Éxito!
      toast.success("¡Cuenta verificada con éxito!");
      // Enviamos al usuario a iniciar sesión
      router.push("/login");
    }
  };

  // 3. Manejar el reenvío del código
  const handleResendCode = async () => {
    setIsResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    setIsResending(false);

    if (error) {
      toast.error("Error al reenviar el código. Intenta más tarde.");
    } else {
      toast.success("¡Nuevo código enviado a tu correo!");
    }
  };

  return (
    // Usamos h-screen para centrado vertical perfecto
    <div className="flex items-center justify-center h-screen p-4">
      <Card className="w-full max-w-md border border-primary rounded-md">
        <CardHeader className="pb-0">
          <div className="mb-6">
            <Link
              href="/register" // Volver a registro
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Link>
          </div>
          <div className="space-y-2 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Revisa tu correo
            </h1>
            <p className="text-sm text-muted-foreground">
              Hemos enviado un código de 6 dígitos a{" "}
              <strong className="text-primary">{email}</strong>.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 flex flex-col items-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verificando...
                </div>
              ) : (
                "Verificar cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              ¿No recibiste el código?{" "}
            </span>
            <Button
              variant="link"
              className="text-primary p-0 h-auto"
              onClick={handleResendCode}
              disabled={isResending}
            >
              {isResending ? "Reenviando..." : "Reenviar código"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}