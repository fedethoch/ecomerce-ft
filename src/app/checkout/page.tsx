"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tag, Loader2, ShoppingBag, CreditCard, Shield, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import MercadoPago from "@/components/icons/mercado-pago"
import PayPal from "@/components/icons/paypal"
import { toast } from "sonner"
import { createPreference } from "@/controllers/payment-controller"
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler"
import { AppActionException } from "@/types/exceptions"
import { useRouter } from "next/navigation"
import { CheckoutSkeleton } from "@/components/skeletons/checkout-skeleton"
import { useCart } from "@/context/cart-context"

const Checkout = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"mercadopago" | "paypal">("mercadopago")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()

  const { cart } = useCart()

  // Si el carrito está vacío, redirige o muestra mensaje
  useEffect(() => {
    if (cart.length === 0) {
      setIsRedirecting(true)                        // 👈 evita render/llamadas extra
      toast.error("Tu carrito está vacío.")
      router.push("/productos")
      return                                         // 👈 corta el efecto
    }
  }, [cart, router])  

  if (isRedirecting) return null

  const handleContinuePayment = async () => {
    setIsLoading(true)
    try {
      if (!acceptTerms) {
        return toast.warning("Debes aceptar los términos y condiciones para continuar")
      }
      const result = await actionErrorHandler(async () => {
        return await createPreference({
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
          payment_method: selectedPaymentMethod,
        })
      })

      if (result.init_point) {
        // ⛔️ ANTES estaba clearCart() acá —> lo removemos
        router.push(result.init_point)
        return
      }
    } catch (error) {
      if (error instanceof AppActionException) {
        return toast.error(error.userMessage)
      }
    } finally {
      setIsLoading(false)
    }
}

  // Calculate total
  const currency = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 })
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with breadcrumb style */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <ShoppingBag className="w-4 h-4" />
            <span>Carrito</span>
            <span>→</span>
            <span className="text-slate-900 font-medium">Checkout</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Finalizar inscripción
          </h1>
          <p className="text-slate-600 mt-2">Revisa tu pedido y completa el pago de forma segura</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Resumen del pedido</h2>
                </div>

                <div className="space-y-6">
                  {cart.map((product, index) => (
                    <div key={product.id} className="group">
                      <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200/50 hover:shadow-lg transition-all duration-300">
                        <div className="relative w-full md:w-48 h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              Array.isArray(product.imagePaths) && product.imagePaths.length > 0
                                ? product.imagePaths[0]
                                : "/placeholder.svg"
                            }
                            alt={product.name || "Imagen del producto"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-slate-700">
                            #{index + 1}
                          </div>
                        </div>

                        <div className="flex-1 space-y-4">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200/50">
                              <div className="text-sm text-slate-600 mb-1">Cantidad</div>
                              <div className="text-lg font-bold text-slate-900">{product.quantity}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200/50">
                              <div className="text-sm text-slate-600 mb-1">Precio unitario</div>
                              <div className="text-lg font-bold text-slate-900">{currency.format(product.price)}</div>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200/50">
                              <div className="text-sm text-slate-600 mb-1">Subtotal</div>
                              <div className="text-lg font-bold text-blue-600">
                                {currency.format(product.price * product.quantity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < cart.length - 1 && <Separator className="my-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Método de pago</h2>
                </div>

                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={(value) => setSelectedPaymentMethod(value as "mercadopago" | "paypal")}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {/* Mercado Pago */}
                  <div className="relative">
                    <RadioGroupItem value="mercadopago" id="mercadopago" className="sr-only" />
                    <Label
                      htmlFor="mercadopago"
                      className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedPaymentMethod === "mercadopago"
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <MercadoPago className="w-16 h-16" />
                          {selectedPaymentMethod === "mercadopago" && (
                            <CheckCircle2 className="w-6 h-6 text-blue-500 absolute -top-2 -right-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-bold text-lg text-slate-900">Mercado Pago</span>
                        <span className="text-sm text-slate-600">Pago seguro y rápido</span>
                      </div>
                    </Label>
                  </div>

                  {/* PayPal */}
                  <div className="relative">
                    <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                    <Label
                      htmlFor="paypal"
                      className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                        selectedPaymentMethod === "paypal"
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                          : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-md"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <PayPal className="w-16 h-16" />
                          {selectedPaymentMethod === "paypal" && (
                            <CheckCircle2 className="w-6 h-6 text-blue-500 absolute -top-2 -right-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-bold text-lg text-slate-900">PayPal</span>
                        <span className="text-sm text-slate-600">Protección del comprador</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white sticky top-8">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  Resumen de pago
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Subtotal</span>
                    <span className="font-semibold">{currency.format(total)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Impuestos</span>
                    <span className="font-semibold">Incluidos</span>
                  </div>
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-green-400">${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      className="cursor-pointer mt-1 border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-slate-900"
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer text-slate-200">
                      Acepto los{" "}
                      <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                        términos y condiciones
                      </Link>{" "}
                      del curso
                    </Label>
                  </div>
                </div>

                {/* Continue Button */}
                <Button
                  onClick={handleContinuePayment}
                  disabled={!acceptTerms || isLoading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Procesando pago...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <span>Continuar con el pago</span>
                    </div>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Shield className="w-4 h-4" />
                  <span>Pago seguro y encriptado</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Compra protegida
                </h4>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Encriptación SSL de 256 bits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Protección contra fraude</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Garantía de devolución</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <Checkout />
    </Suspense>
  )
}
