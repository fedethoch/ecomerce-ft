"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative flex h-[calc(100vh-136px)] items-center justify-center overflow-hidden bg-background">
      {/* Fondo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/elegant-women.jpg"
          alt="Hero Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Etiqueta */}
          <div className="mb-4">
            <span className="inline-block rounded-full bg-accent px-4 py-2 text-sm font-medium uppercase tracking-wide text-accent-foreground">
              Nueva Colección
            </span>
          </div>

          {/* Título */}
          <h1 className="mb-8 font-bold leading-[0.9] tracking-tight text-white drop-shadow-lg text-5xl md:text-7xl lg:text-8xl">
            <span className="block">Descubre tu</span>
            <span className="mt-2 block text-accent">Estilo Único</span>
          </h1>

          {/* Descripción */}
          <p className="mx-auto mb-12 max-w-3xl text-xl font-light leading-relaxed text-white md:text-2xl">
            Explora nuestra colección de moda contemporánea diseñada para
            quienes buscan
            <span className="font-medium text-accent">
              {" "}
              elegancia y autenticidad
            </span>{" "}
            en cada pieza.
          </p>

          {/* Botones */}
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            {/* Botón primario */}
            <Button
              asChild
              size="lg"
              className="rounded-full px-10 py-7 text-lg font-semibold shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/productos" className="flex items-center gap-2">
                Explorar Colección
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </Button>

            {/* Botón secundario (outline/accent) */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-2 border-accent px-10 py-7 text-lg font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground"
            >
              {/* --- MODIFICACIÓN AQUÍ --- */}
              <Link
                href="/productos?isNew=true"
                className="flex items-center gap-2"
              >
              {/* --- FIN DE LA MODIFICACIÓN --- */}
                Ver Novedades
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}