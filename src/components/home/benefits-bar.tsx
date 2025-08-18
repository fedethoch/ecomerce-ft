"use client"

import { useState, useEffect } from "react"
import { Truck, Shield, RotateCcw, CreditCard, Clock, ChevronLeft, ChevronRight } from "lucide-react"

const benefits = [
  { icon: Truck, text: "Envío gratis en compras mayores a $50.000" },
  { icon: Shield, text: "Garantía de calidad en todas nuestras prendas" },
  { icon: RotateCcw, text: "Cambios y devoluciones hasta 30 días" },
  { icon: CreditCard, text: "Paga en hasta 12 cuotas sin interés" },
  { icon: Clock, text: "Entrega express en 24-48 horas" },
]

export function BenefitsBar() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % benefits.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused])

  const pauseAnd = (fn: () => void) => {
    setIsPaused(true)
    fn()
    setTimeout(() => setIsPaused(false), 10000)
  }

  const goToPrevious = () =>
    pauseAnd(() => setCurrentIndex((prev) => (prev - 1 + benefits.length) % benefits.length))
  const goToNext = () =>
    pauseAnd(() => setCurrentIndex((prev) => (prev + 1) % benefits.length))

  const currentBenefit = benefits[currentIndex]
  const Icon = currentBenefit.icon

  return (
    <div
      className="bg-primary text-primary-foreground py-2 px-4 overflow-hidden"
      role="region"
      aria-live="polite"
    >
      <div className="relative flex min-h-[32px] items-center justify-center gap-2">
        <button
          onClick={goToPrevious}
          className="absolute left-0 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary-hover/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Beneficio anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          key={currentIndex}
          className="flex items-center gap-2 animate-in fade-in duration-500"
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium text-center">{currentBenefit.text}</span>
        </div>

        <button
          onClick={goToNext}
          className="absolute right-0 inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-primary-hover/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Siguiente beneficio"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-1 flex justify-center gap-1">
        {benefits.map((_, index) => (
          <div
            key={index}
            className={
              "h-1 w-6 rounded-full transition-all duration-300 " +
              (index === currentIndex ? "bg-primary-foreground" : "bg-primary-foreground/30")
            }
          />
        ))}
      </div>
    </div>
  )
}
