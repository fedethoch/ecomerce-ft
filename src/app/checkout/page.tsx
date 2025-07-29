"use client"

import { useState } from "react"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { OrderConfirmation } from "@/components/checkout/order-confirmation"

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [orderData, setOrderData] = useState({
    shipping: {},
    payment: {},
    items: [],
  })

  const handleStepComplete = (stepData: any) => {
    setOrderData((prev) => ({ ...prev, ...stepData }))
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ShippingForm onComplete={handleStepComplete} />
      case 2:
        return <PaymentForm onComplete={handleStepComplete} />
      case 3:
        return <OrderConfirmation orderData={orderData} />
      default:
        return <ShippingForm onComplete={handleStepComplete} />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <CheckoutSteps currentStep={currentStep} />
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="lg:w-2/3">{renderStep()}</div>
          <div className="lg:w-1/3">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
