export type ProductType = {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  category: string
  isNew?: boolean
  isSale?: boolean
  sizes: string[]
  image: string[]
  
};

export type ProductStatus = "Activo" | "Bajo Stock" | "Agotado"