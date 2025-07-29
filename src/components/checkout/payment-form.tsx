"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Smartphone } from "lucide-react"

interface PaymentFormProps {
  onComplete: (data: any) => void
}

export function PaymentForm({ onComplete }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({ payment: { method: paymentMethod, ...formData } })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                <CreditCard className="w-5 h-5" />
                <span>Tarjeta de Crédito/Débito</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="mercadopago" id="mercadopago" />
              <Label htmlFor="mercadopago" className="flex items-center space-x-2 cursor-pointer">
                <Smartphone className="w-5 h-5" />
                <span>MercadoPago</span>
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "card" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div>
                <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                <Input
                  id="cardName"
                  value={formData.cardName}
                  onChange={(e) => handleChange("cardName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Número de tarjeta</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleChange("cardNumber", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Fecha de vencimiento</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/AA"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange("expiryDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => handleChange("cvv", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Finalizar Compra
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
