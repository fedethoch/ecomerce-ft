import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
})

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, {
      message: "La contraseña debe tener al menos una letra mayúscula",
    })
    .regex(/[a-z]/, {
      message: "La contraseña debe tener al menos una letra minúscula",
    })
    .regex(/[0-9]/, { message: "La contraseña debe tener al menos un número" })
    .regex(/[!@#$%^&*]/, {
      message: "La contraseña debe tener al menos un carácter especial",
    }),
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(255, { message: "El nombre debe tener menos de 255 caracteres" }),
  phone: z
    .string()
    .min(8, { message: "El teléfono debe tener al menos 8 caracteres" })
    .max(15, { message: "El teléfono debe tener menos de 15 caracteres" })
    .regex(/^\d+$/, { message: "El teléfono debe contener solo números" }),
})