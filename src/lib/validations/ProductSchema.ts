import { z } from "zod";

// Esquema para tamaños
const SizeSchema = z.enum(["XS", "S", "M", "L", "XL", "XXL"]);

// Esquema principal para productos
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().min(0.01, "El precio debe ser mayor a 0"),
  originalPrice: z.number().optional().nullable(),
  quantity: z.number().int("Debe ser entero").min(0, "No puede ser negativo"),
  category: z.string().min(1, "La categoría es requerida"),
  isNew: z.boolean().optional().default(false),
  isSale: z.boolean().optional().default(false),
  sizes: z.array(z.string()).min(1, "Selecciona al menos una talla"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  imagePaths: z.array(z.string().url("URL inválida"))
    .min(1, "Al menos 1 imagen requerida")
});

// Esquema para creación de productos (sin ID)
export const ProductCreationSchema = ProductSchema.omit({ 
  imagePaths: true 
}).extend({
  imageFile: z.instanceof(File, { message: "Archivo requerido" })
    .refine(file => file.size <= 5 * 1024 * 1024, "Máximo 5MB")
    .refine(file => [
      "image/jpeg", 
      "image/png", 
      "image/webp"
    ].includes(file.type), "Formato inválido (JPEG, PNG, WEBP)")
});

// Esquema para actualización de productos
export const ProductUpdateSchema = ProductCreationSchema.partial();

// Tipos derivados
export type ProductFormValues = z.infer<typeof ProductCreationSchema>;
export type ProductUpdateValues = z.infer<typeof ProductUpdateSchema>;