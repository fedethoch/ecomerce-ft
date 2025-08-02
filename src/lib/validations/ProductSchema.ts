import { z } from "zod"

export const ProductSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido" }),
  start_date: z.date().min(
    new Date(Date.now() - 24 * 60 * 60 * 1000), // Un día antes de hoy
    {
      message:
        "La fecha de inicio debe ser como máximo un día antes de la fecha actual",
    }
  ),
  end_date: z.date().min(new Date(), {
    message: "La fecha de fin debe ser mayor a la fecha actual",
  }),
  modality: z.string().min(1, { message: "La modalidad es requerida" }),
  price_ars: z.number().min(1, { message: "El precio en ARS es requerido" }),
  price_usd: z.number().min(1, { message: "El precio en USD es requerido" }),
  target_audience: z
    .string()
    .min(1, { message: "El público objetivo es requerido" }),
  image_url: z.string().min(1, { message: "La URL de la imagen es requerida" }),
  teacher: z.string().min(1, { message: "El profesor es requerido" }),
  objectives: z.array(z.string()).min(1, {
    message: "Los objetivos son requeridos",
  }),
  modules: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, { message: "El título del módulo es requerido" }),
        subtopics: z.array(z.string()).min(1, {
          message: "Debe haber al menos un subtema",
        }),
        video_url: z
          .string()
          .min(1, { message: "La URL del video es requerida" }),
      })
    )
    .min(1, { message: "Debe haber al menos un módulo" }),
})

export const ModuleSchema = z.object({
  id: z.string().min(1, { message: "El ID del módulo es requerido" }),
  title: z.string().min(1, { message: "El título del módulo es requerido" }),
  subtopics: z.array(z.string()).min(1, {
    message: "Debe haber al menos un subtema",
  }),
  video_url: z.string().min(1, { message: "La URL del video es requerida" }),
})

// Schema para validar los datos del formulario antes de procesar archivos
export const ProductFormDataSchema = z
  .object({
    name: z.string().min(1, { message: "El nombre del curso es requerido" }),
    modality: z.string().min(1, { message: "La modalidad es requerida" }),
    target_audience: z
      .string()
      .min(1, { message: "El público objetivo es requerido" }),
    teacher: z.string().min(1, { message: "El profesor es requerido" }),
    price_ars: z
      .number()
      .min(0.01, { message: "El precio en ARS debe ser mayor a 0" }),
    price_usd: z
      .number()
      .min(0.01, { message: "El precio en USD debe ser mayor a 0" }),
    objectives: z
      .array(z.string().min(1))
      .min(1, { message: "Debe haber al menos un objetivo" }),
    start_date: z.date().min(new Date(Date.now() - 24 * 60 * 60 * 1000), {
      message:
        "La fecha de inicio debe ser como máximo un día antes de la fecha actual",
    }),
    end_date: z.date().min(new Date(), {
      message: "La fecha de fin debe ser mayor a la fecha actual",
    }),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "La fecha de inicio no puede ser mayor a la fecha de fin",
    path: ["start_date"],
  })

// Schema para validar los módulos del formulario
export const ModuleFormDataSchema = z.object({
  id: z.string().min(1, { message: "El ID del módulo es requerido" }),
  title: z.string().min(1, { message: "El título del módulo es requerido" }),
  topics: z
    .array(
      z.object({
        name: z
          .string()
          .min(1, { message: "El nombre del subtema es requerido" }),
      })
    )
    .min(1, { message: "Debe haber al menos un subtema" }),
})