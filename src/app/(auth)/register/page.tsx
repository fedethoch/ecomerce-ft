"use client"

import Link from "next/link"
import { ArrowLeft, Loader2, Eye, EyeOff, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/dist/client/components/navigation"
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler"
import { AppActionException } from "@/types/exceptions"
import { toast } from "sonner"
import { createUser } from "@/controllers/auth-controller"

export default function RegisterPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [isTermsAccepted, setIsTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState("")

  const hasUppercase = /[A-Z]/.test(passwordValue)
  const hasNumber = /[0-9]/.test(passwordValue)
  const hasMinLength = passwordValue.length >= 8
  const hasSpecialChar = /[^A-Za-z0-9]/.test(passwordValue)

  const handleSubmitWithGoogle = async () => {
    try {
      const baseUrl = typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL ?? "");
      await actionErrorHandler(async () => {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${baseUrl}/auth/callback`
          },
        })
      })

      return
    } catch (error) {
      if (error instanceof AppActionException) {
        toast.error(error.userMessage || error.message)
      } else {
        toast.error("Ocurrió un error al iniciar sesión con Google")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const name = formData.get("fullName") as string
      const phone = formData.get("phone") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (!isTermsAccepted) {
        toast.error("Debes aceptar los términos y condiciones")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        toast.error("Las contraseñas no coinciden")
        setIsLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone
            },
            emailRedirectTo: `http://localhost:3000/auth/callback`
          }
        });

        if (error) throw new AppActionException(
          error.status || 400, // Usamos el status de Supabase o 400 por defecto
          error.message,       // Mensaje técnico
          "Error de registro", // Mensaje amigable para el usuario
          {
            // Opcional: mapear errores de Supabase a campos del formulario
            email: [error.message.includes("email") ? "Correo inválido" : ""].filter(Boolean),
            password: [error.message.includes("password") ? "Contraseña débil" : ""].filter(Boolean)
          }
        );

        // Solo redirigir si no hay error
        router.push(`/verify?email=${email}`);
      } catch (error) {
      if (error instanceof AppActionException) {
        if (error.fieldErrors) {
          const fieldErrors = error.fieldErrors

          Object.entries(fieldErrors).forEach(([field, errors]) => {
            const fieldName = getFieldDisplayName(field)
            errors.forEach((errorMessage) => {
              toast.error(`${fieldName}: ${errorMessage}`)
            })
          })

          return
        }

        return toast.warning(error.userMessage || error.message)
      }

      toast.error("Ocurrió un error al crear el usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      email: "Email",
      password: "Contraseña",
      name: "Nombre",
      phone: "Teléfono",
    }
    return fieldNames[field] || field
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md border border-primary rounded-md">
        <CardHeader className="pb-0">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Link>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              Crear una cuenta
            </h1>
            <p className="text-sm text-muted-foreground">
              Únete a Edumine y comienza tu aprendizaje
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Nombre Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Número Telefónico
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  placeholder="********"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-gray-200 rounded-md p-1 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Requisitos de contraseña visuales */}
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  {hasUppercase ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span
                    className={
                      hasUppercase ? "text-green-600" : "text-gray-500"
                    }
                  >
                    Mayúscula
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {hasNumber ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span
                    className={hasNumber ? "text-green-600" : "text-gray-500"}
                  >
                    Número
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {hasMinLength ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span
                    className={
                      hasMinLength ? "text-green-600" : "text-gray-500"
                    }
                  >
                    8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {hasSpecialChar ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span
                    className={
                      hasSpecialChar ? "text-green-600" : "text-gray-500"
                    }
                  >
                    Especial
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Repetir Contraseña
              </Label>
              <div className="relative">
                <Input
                  placeholder="********"
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary hover:bg-gray-200 rounded-md p-1 focus:outline-none"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                className="cursor-pointer"
                id="terms"
                name="terms"
                required
                checked={isTermsAccepted}
                onCheckedChange={() => setIsTermsAccepted(!isTermsAccepted)}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline -ml-1"
                >
                  Términos y Condiciones
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Procesando...
                </div>
              ) : (
                "Registrarme"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-2 text-sm text-muted-foreground">
                o
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full cursor-pointer"
            type="button"
            onClick={handleSubmitWithGoogle}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Registrarte con Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
            <Link href="/login" className="text-primary hover:underline">
              Inicia Sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}