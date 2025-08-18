"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí podrías integrar la lógica real de suscripción
    setEmail("")
  }

  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Mantente al día con las últimas tendencias
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Suscríbete a nuestro newsletter y recibe ofertas exclusivas, nuevos
            lanzamientos y consejos de estilo.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
            />
            <Button
              type="submit"
              variant="secondary"
              className="whitespace-nowrap"
            >
              Suscribirse
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
