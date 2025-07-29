"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock newsletter signup - just clear the email
    setEmail("")
  }

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mantente al día con las últimas tendencias</h2>
          <p className="text-lg mb-8 opacity-90">
            Suscríbete a nuestro newsletter y recibe ofertas exclusivas, nuevos lanzamientos y consejos de estilo.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white text-black"
            />
            <Button type="submit" variant="secondary" className="whitespace-nowrap">
              Suscribirse
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
