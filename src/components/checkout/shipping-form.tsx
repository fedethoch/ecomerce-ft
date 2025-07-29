"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ShippingFormProps {
  onComplete: (data: any) => void
}

export function ShippingForm({ onComplete }: ShippingFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Argentina",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete({ shipping: formData })
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Envío</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="state">Provincia</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Código Postal</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleChange("zipCode", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="country">País</Label>
            <Select value={formData.country} onValueChange={(value) => handleChange("country", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="Uruguay">Uruguay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Continuar al Pago
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
