"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

interface ProductTabsProps {
  product: {
    description: string
    specifications: Record<string, string>
    reviews: Array<{
      id: string
      user: string
      rating: number
      comment: string
      date: string
    }>
  }
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description")

  const tabs = [
    { id: "description", label: "Descripción" },
    { id: "specifications", label: "Especificaciones" },
    { id: "reviews", label: `Reseñas (${product.reviews.length})` },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Detalles del Producto</h4>
              <p className="text-muted-foreground">
                Este producto ha sido cuidadosamente seleccionado por nuestro equipo de expertos en moda. Fabricado con
                materiales de la más alta calidad, garantiza durabilidad y comodidad en cada uso.
              </p>
            </div>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between py-3 border-b">
                <span className="font-medium">{key}:</span>
                <span className="text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            {/* Reviews Summary */}
            <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {(product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length).toFixed(
                    1,
                  )}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <
                        Math.floor(
                          product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length,
                        )
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{product.reviews.length} reseñas</div>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = product.reviews.filter((review) => review.rating === rating).length
                  const percentage = (count / product.reviews.length) * 100
                  return (
                    <div key={rating} className="flex items-center gap-2 mb-1">
                      <span className="text-sm w-3">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{review.user}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
