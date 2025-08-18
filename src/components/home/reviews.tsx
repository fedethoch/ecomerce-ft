"use client"

import { Star } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Review {
  id: number
  name: string
  rating: number
  comment: string
  product: string
  verified: boolean
}

const reviews: Review[] = [
  {
    id: 1,
    name: "María González",
    rating: 5,
    comment: "La calidad de la ropa es excepcional. Los materiales se sienten premium y el ajuste es perfecto.",
    product: "Vestido de verano",
    verified: true,
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    rating: 5,
    comment: "Excelente servicio al cliente y envío rápido. La camisa llegó exactamente como se veía en las fotos.",
    product: "Camisa casual",
    verified: true,
  },
  {
    id: 3,
    name: "Ana Martínez",
    rating: 5,
    comment: "Me encanta la variedad de estilos. Siempre encuentro algo perfecto para cada ocasión.",
    product: "Conjunto completo",
    verified: true,
  },
]

export default function Reviews() {
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  const totalReviews = 1247 // Número simulado de reviews totales

  return (
    <section className="py-16 px-4" style={{ backgroundColor: "#F8F7F4" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" style={{ color: "#8B1E3F" }} />
              ))}
            </div>
            <span className="text-2xl font-bold" style={{ color: "#0B1220" }}>
              {averageRating.toFixed(1)}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "#0B1220" }}>
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg" style={{ color: "#6B7280" }}>
            Más de {totalReviews.toLocaleString()} clientes satisfechos confían en nosotros
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="p-6 transition-all duration-300 hover:shadow-lg border-2"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E7E5E4",
              }}
            >
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "fill-current" : "fill-none"}`}
                    style={{
                      color: i < review.rating ? "#8B1E3F" : "#E7E5E4",
                      stroke: i < review.rating ? "#8B1E3F" : "#E7E5E4",
                    }}
                  />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="text-base mb-4 leading-relaxed" style={{ color: "#0B1220" }}>
                {review.comment}
              </blockquote>

              {/* Reviewer Info */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: "#0B1220" }}>
                      {review.name}
                    </p>
                    {review.verified && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: "#D6C6B2",
                          color: "#0B1220",
                        }}
                      >
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    Compró: {review.product}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            className="px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            style={{
              backgroundColor: "#1E3A8A",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#172C6F"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1E3A8A"
            }}
          >
            Ver todas las reseñas
          </button>
        </div>
      </div>
    </section>
  )
}
