import { ProductType } from "@/types/products/products"

export type ProductStatus = "Agotado" | "Bajo Stock" | "Activo"

export function getProductStatus(product: ProductType): ProductStatus {
  if (product.quantity === 0) return "Agotado"
  if (product.quantity <= 10) return "Bajo Stock"
  return "Activo"
}