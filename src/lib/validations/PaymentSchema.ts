import { z } from "zod";

// Address validation schema
export const addressSchema = z.object({
  full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  line1: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad debe tener al menos 2 caracteres"),
  state: z.string().min(1, "Debes seleccionar una provincia"),
  postal_code: z
    .string()
    .regex(/^\d{4}$/, "El código postal debe tener 4 dígitos"),
  country: z.literal("AR"),
  phone: z
    .string()
    .regex(
      /^\+?54\s?9?\s?\d{2,4}\s?\d{6,8}$/,
      "Formato de teléfono inválido (ej: +54 11 1234-5678)"
    ),
});

// Shipping method validation
export const shippingMethodSchema = z.object({
  method_id: z.string().min(1, "Debes seleccionar un método de envío"),
});

// Payment method validation
export const paymentMethodSchema = z.object({
  payment_method: z.enum(["mercadopago", "paypal"], {
    error: "Debes seleccionar un método de pago válido",
  }),
});

// Terms validation
export const termsSchema = z.object({
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

// Complete checkout validation
export const checkoutSchema = z.object({
  address: addressSchema,
  shipping_method_id: z.string().min(1, "Debes seleccionar un método de envío"),
  payment_method: z.enum(["mercadopago", "paypal"]),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

export type AddressFormData = z.infer<typeof addressSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
