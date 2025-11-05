"use client"

import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler"
import { createClient } from "@/lib/supabase/client"
import { AppActionException } from "@/types/exceptions"
import { toast } from "sonner"
import { loginUser } from "@/controllers/auth-controller"

export default function LoginPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmitWithGoogle = async () => {
    try {
      await actionErrorHandler(async () => {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              process.env.NODE_ENV === "development"
                ? "https://ecomerce-ft.vercel.app/auth/callback"
                : "",
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

      await actionErrorHandler(async () => loginUser({ email, password }))

      toast.success("Inicio de sesión exitoso")
      return router.push("/")
    } catch (error) {
      if (error instanceof AppActionException) {
        toast.error(error.userMessage || error.message)
      } else {
        toast.error("Ocurrió un error al iniciar sesión")
      }
    } finally {
      setIsLoading(false)
    }
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
              Iniciar sesión
            </h1>
            <p className="text-sm text-muted-foreground">
              Únete a Edumine y comienza tu aprendizaje
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                required
              />
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
                "Ingresar"
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
            variant={"outline"}
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
            Iniciar Sesión con Google
          </Button>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/recover-password"
              className="text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes cuenta? </span>
            <Link href="/register" className="text-primary hover:underline">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}