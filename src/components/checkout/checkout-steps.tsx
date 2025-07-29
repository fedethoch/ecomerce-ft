import { Check } from "lucide-react"

interface CheckoutStepsProps {
  currentStep: number
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { number: 1, title: "Información de envío" },
    { number: 2, title: "Método de pago" },
    { number: 3, title: "Confirmación" },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                currentStep > step.number
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.number
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
            </div>
            <span className="text-sm mt-2 text-center">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  )
}
