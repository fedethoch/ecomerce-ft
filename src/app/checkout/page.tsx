"use client";

import type React from "react";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tag,
  Loader2,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Truck,
  MapPin,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import MercadoPago from "@/components/icons/mercado-pago";
import PayPal from "@/components/icons/paypal";
import { createPreference } from "@/controllers/payment-controller";
import { quoteShipping } from "@/controllers/shipping-controller";
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler";
import { CheckoutSkeleton } from "@/components/skeletons/checkout-skeleton";
import { useCart } from "@/context/cart-context";
import {
  addressSchema,
  paymentMethodSchema,
  termsSchema,
} from "@/lib/validations/PaymentSchema";

type ShippingOption = {
  method_id: string;
  label: string;
  provider?: string;
  service_level: "standard" | "express" | "pickup";
  amount: number;
  eta_min_days: number;
  eta_max_days: number;
};

const provincesAR = [
  "CABA",
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

const steps = [
  { id: "order", title: "Pedido", description: "Revisar productos" },
  { id: "address", title: "Dirección", description: "Datos de envío" },
  { id: "shipping", title: "Envío", description: "Método de entrega" },
  { id: "payment", title: "Pago", description: "Método de pago" },
  { id: "review", title: "Confirmar", description: "Revisar y pagar" },
];

const StepIndicator = ({
  steps,
  currentStep,
}: {
  steps: any[];
  currentStep: number;
}) => (
  <div className="flex items-center justify-center mb-8">
    {steps.map((step, index) => (
      <div key={step.id} className="flex items-center">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
            index < currentStep
              ? "bg-green-500 text-white"
              : index === currentStep
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-500"
          }`}
        >
          {index < currentStep ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            index + 1
          )}
        </div>
        {index < steps.length - 1 && (
          <div
            className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
              index < currentStep ? "bg-green-500" : "bg-gray-200"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const StepContent = ({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) => (
  <div
    className={`transition-all duration-700 ease-in-out ${
      isActive
        ? "opacity-100 translate-x-0 scale-100"
        : "opacity-0 translate-x-8 scale-95 pointer-events-none absolute"
    }`}
  >
    {children}
  </div>
);

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "mercadopago" | "paypal"
  >("mercadopago");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [address, setAddress] = useState({
    full_name: "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "AR" as const,
    phone: "",
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const router = useRouter();
  const { cart } = useCart();

  useEffect(() => {
    if (cart.length === 0) {
      setIsRedirecting(true);
      toast.error("Tu carrito está vacío.");
      router.push("/productos");
      return;
    }
  }, [cart, router]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.method_id === selectedMethodId) || null,
    [shippingOptions, selectedMethodId]
  );
  const shippingAmount = selectedShipping?.amount ?? 0;
  const total = subtotal + (selectedMethodId ? shippingAmount : 0);

  useEffect(() => {
    // Siempre agregamos la opción de retiro en el local
    const pickupOption: ShippingOption = {
      method_id: "pickup",
      label: "Retirar en el local",
      provider: undefined,
      service_level: "pickup",
      amount: 0,
      eta_min_days: 0,
      eta_max_days: 0,
    };

    const ready = !!address.state && !!address.postal_code && cart.length > 0;
    if (!ready) {
      setShippingOptions([pickupOption]);
      setSelectedMethodId("pickup");
      return;
    }

    setIsQuoting(true);
    const items = cart.map((i) => ({ product_id: i.id, quantity: i.quantity }));
    actionErrorHandler(async () => {
      const options = await quoteShipping({ items, address });
      const allOptions = [pickupOption, ...options];
      setShippingOptions(allOptions);
      setSelectedMethodId(allOptions[0]?.method_id ?? null);
    })
      .catch((e: any) => {
        toast.error(e?.userMessage || "No se pudo cotizar el envío");
        setShippingOptions([pickupOption]);
        setSelectedMethodId("pickup");
      })
      .finally(() => setIsQuoting(false));
  }, [address.state, address.postal_code, cart, address, setIsQuoting]);

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        return cart.length > 0;
      case 1:
        try {
          addressSchema.parse(address);
          return true;
        } catch (error: any) {
          error.errors?.forEach((err: any) => {
            newErrors[err.path[0]] = err.message;
          });
          setValidationErrors(newErrors);
          return false;
        }
      case 2:
        if (!selectedMethodId) {
          newErrors.shipping = "Debes seleccionar un método de envío";
          setValidationErrors(newErrors);
          return false;
        }
        return true;
      case 3:
        try {
          paymentMethodSchema.parse({ payment_method: selectedPaymentMethod });
          return true;
        } catch (error: any) {
          newErrors.payment = "Debes seleccionar un método de pago válido";
          setValidationErrors(newErrors);
          return false;
        }
      case 4:
        try {
          termsSchema.parse({ accept_terms: acceptTerms });
          return true;
        } catch (error: any) {
          newErrors.terms = "Debes aceptar los términos y condiciones";
          setValidationErrors(newErrors);
          return false;
        }
      default:
        return false;
    }
  }, [
    currentStep,
    cart.length,
    address,
    selectedMethodId,
    selectedPaymentMethod,
    acceptTerms,
  ]);

  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 0:
        return cart.length > 0;
      case 1:
        try {
          addressSchema.parse(address);
          return true;
        } catch {
          return false;
        }
      case 2:
        return selectedMethodId !== null;
      case 3:
        return selectedPaymentMethod !== null;
      case 4:
        return acceptTerms;
      default:
        return false;
    }
  }, [
    currentStep,
    cart.length,
    address,
    selectedMethodId,
    selectedPaymentMethod,
    acceptTerms,
  ]);

  useEffect(() => {
    setValidationErrors({});
  }, [currentStep]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const isValid = validateCurrentStep();
      if (isValid) {
        setTimeout(() => {
          setCurrentStep(currentStep + 1);
        }, 300);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 300);
    }
  };

  const handleContinuePayment = async () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      return;
    }

    try {
      addressSchema.parse(address);
      paymentMethodSchema.parse({ payment_method: selectedPaymentMethod });
      termsSchema.parse({ accept_terms: acceptTerms });
    } catch (error: any) {
      toast.error("Por favor, completa todos los campos correctamente");
      return;
    }

    if (!selectedMethodId) {
      toast.warning("Elegí un método de envío");
      return;
    }

    setIsLoading(true);
    try {
      const shipping = selectedShipping
        ? {
            id: selectedShipping.method_id,           // "pickup" o id del carrier
            amount: selectedShipping.amount,          // 0 para pickup
            label: selectedShipping.label,
            service_level: selectedShipping.service_level, // "pickup" | "standard" | "express"
          }
        : null;

      const result = await actionErrorHandler(async () => {
        return await createPreference({
          items: cart.map(i => ({ product_id: i.id, quantity: i.quantity })),
          payment_method: selectedPaymentMethod,
          address,                 // el server lo ignora si es pickup
          shipping_method_id: selectedMethodId!, // "pickup" o el carrier
        });
      });

      if (result.init_point) {
        router.push(result.init_point);
        return;
      }
    } catch (error: any) {
      const msg =
        error?.userMessage || error?.message || "No se pudo iniciar el pago";
      toast.error(msg);
      if ((error?.statusCode ?? 0) === 401) {
        router.push("/login?next=/checkout");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isRedirecting) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Finalizar inscripción
          </h1>
          <p className="text-gray-600">
            Completa tu pedido en {steps.length} simples pasos
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative min-h-[500px] mb-8 overflow-hidden">
              <StepContent isActive={currentStep === 0}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      Confirmar productos
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Revisa los productos en tu carrito. Puedes ver el resumen
                      completo en el panel lateral.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm">
                        ✓ {cart.length} producto{cart.length !== 1 ? "s" : ""}{" "}
                        en tu carrito
                      </p>
                      <p className="text-blue-600 text-sm mt-1">
                        Total: {currency.format(subtotal)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </StepContent>

              <StepContent isActive={currentStep === 1}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Dirección de entrega
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Nombre completo</Label>
                        <input
                          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                            validationErrors.full_name
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          value={address.full_name}
                          onChange={(e) =>
                            setAddress((a) => ({
                              ...a,
                              full_name: e.target.value,
                            }))
                          }
                          placeholder="Tu nombre"
                        />
                        {validationErrors.full_name && (
                          <p className="text-xs text-red-500">
                            {validationErrors.full_name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Teléfono</Label>
                        <input
                          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                            validationErrors.phone
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          value={address.phone}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, phone: e.target.value }))
                          }
                          placeholder="+54 11 ..."
                        />
                        {validationErrors.phone && (
                          <p className="text-xs text-red-500">
                            {validationErrors.phone}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm">Dirección</Label>
                        <input
                          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                            validationErrors.line1
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          value={address.line1}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, line1: e.target.value }))
                          }
                          placeholder="Calle 123, piso/depto"
                        />
                        {validationErrors.line1 && (
                          <p className="text-xs text-red-500">
                            {validationErrors.line1}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Ciudad</Label>
                        <input
                          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                            validationErrors.city
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          value={address.city}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, city: e.target.value }))
                          }
                          placeholder="Ciudad"
                        />
                        {validationErrors.city && (
                          <p className="text-xs text-red-500">
                            {validationErrors.city}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Provincia</Label>
                        <select
                          className={`w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none ${
                            validationErrors.state
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          value={address.state}
                          onChange={(e) =>
                            setAddress((a) => ({ ...a, state: e.target.value }))
                          }
                        >
                          <option value="">Seleccioná</option>
                          {provincesAR.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        {validationErrors.state && (
                          <p className="text-xs text-red-500">
                            {validationErrors.state}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Código postal</Label>
                        <input
                          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                            validationErrors.postal_code
                              ? "border-red-500 focus:border-red-500"
                              : "border-gray-300 focus:border-blue-500"
                          }`}
                          value={address.postal_code}
                          onChange={(e) =>
                            setAddress((a) => ({
                              ...a,
                              postal_code: e.target.value,
                            }))
                          }
                          placeholder="Ej: 1425"
                        />
                        {validationErrors.postal_code && (
                          <p className="text-xs text-red-500">
                            {validationErrors.postal_code}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StepContent>

              <StepContent isActive={currentStep === 2}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Método de envío
                    </h2>
                    {validationErrors.shipping && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          {validationErrors.shipping}
                        </p>
                      </div>
                    )}
                    {isQuoting ? (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Calculando opciones de envío…</span>
                      </div>
                    ) : shippingOptions.length === 0 ? (
                      <div className="text-sm text-gray-600">
                        Completa la dirección para ver las opciones de envío.
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedMethodId ?? undefined}
                        onValueChange={(val) => setSelectedMethodId(val)}
                        className="space-y-3"
                      >
                        {shippingOptions.map((opt) => (
                          <label
                            key={opt.method_id}
                            htmlFor={opt.method_id}
                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${
                              selectedMethodId === opt.method_id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200"
                            }`}
                          >
                            <RadioGroupItem
                              id={opt.method_id}
                              value={opt.method_id}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{opt.label}</span>
                                <span className="font-semibold">
                                  {currency.format(opt.amount)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {opt.method_id === "pickup" 
                                  ? "Disponible inmediatamente • Sin costo de envío"
                                  : `Est. ${opt.eta_min_days}–${opt.eta_max_days} días${opt.provider ? ` • ${opt.provider}` : ""}`
                                }
                              </p>
                            </div>
                          </label>
                        ))}
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>
              </StepContent>

              <StepContent isActive={currentStep === 3}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Método de pago
                    </h2>
                    {validationErrors.payment && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          {validationErrors.payment}
                        </p>
                      </div>
                    )}
                    <RadioGroup
                      value={selectedPaymentMethod}
                      onValueChange={(value) =>
                        setSelectedPaymentMethod(
                          value as "mercadopago" | "paypal"
                        )
                      }
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div className="relative">
                        <RadioGroupItem
                          value="mercadopago"
                          id="mercadopago"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="mercadopago"
                          className={`block p-4 border rounded-lg cursor-pointer transition ${
                            selectedPaymentMethod === "mercadopago"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <MercadoPago className="w-12 h-12" />
                            <span className="font-medium">Mercado Pago</span>
                          </div>
                        </Label>
                      </div>
                      <div className="relative">
                        <RadioGroupItem
                          value="paypal"
                          id="paypal"
                          className="sr-only"
                        />
                        <Label
                          htmlFor="paypal"
                          className={`block p-4 border rounded-lg cursor-pointer transition ${
                            selectedPaymentMethod === "paypal"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center space-y-2">
                            <PayPal className="w-12 h-12" />
                            <span className="font-medium">PayPal</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </StepContent>

              <StepContent isActive={currentStep === 4}>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Confirmar pedido
                    </h2>
                    <div className="mb-6">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) =>
                            setAcceptTerms(checked === true)
                          }
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm leading-relaxed cursor-pointer"
                        >
                          Acepto los{" "}
                          <Link
                            href="/terms"
                            className="text-blue-600 hover:underline"
                          >
                            términos y condiciones
                          </Link>
                        </Label>
                      </div>
                      {validationErrors.terms && (
                        <p className="text-xs text-red-500 mt-2">
                          {validationErrors.terms}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </StepContent>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="flex items-center gap-2 bg-transparent transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!canProceedToNext}
                  className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleContinuePayment}
                  disabled={!acceptTerms || isLoading || !selectedMethodId}
                  className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pagar ahora
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Tu pedido
                  </h3>

                  <div className="max-h-96 overflow-y-auto space-y-4 mb-6 pr-2">
                    {cart.map((product) => (
                      <div
                        key={product.id}
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg transition-all duration-200 hover:bg-gray-100"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              Array.isArray(product.imagePaths) &&
                              product.imagePaths.length > 0
                                ? product.imagePaths[0]
                                : "/placeholder.svg"
                            }
                            alt={product.name || "Producto"}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 mb-1">
                            {product.name}
                          </h4>
                          {product.description && (
                            <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Cantidad: {product.quantity}
                            </span>
                            {product.category && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {currency.format(product.price)} c/u
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {currency.format(
                                product.price * product.quantity
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="mb-4" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {currency.format(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Envío</span>
                      <span className="font-medium">
                        {selectedMethodId
                          ? currency.format(shippingAmount)
                          : "Por calcular"}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>{currency.format(total)}</span>
                    </div>
                  </div>

                  {selectedShipping && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900">
                        Método de envío
                      </p>
                      <p className="text-sm text-blue-800">
                        {selectedShipping.label}
                      </p>
                      <p className="text-xs text-blue-600">
                        {selectedShipping.eta_min_days}–
                        {selectedShipping.eta_max_days} días
                      </p>
                    </div>
                  )}

                  {currentStep >= 3 && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs font-medium text-green-900">
                        Método de pago
                      </p>
                      <p className="text-sm text-green-800 capitalize">
                        {selectedPaymentMethod}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <Checkout />
    </Suspense>
  );
}
