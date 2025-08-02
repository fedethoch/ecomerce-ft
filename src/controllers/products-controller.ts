"use server"

import { actionHandler } from "@/lib/handlers/actionHandler"
import { ProductService } from "@/services/product-service"
import { ProductType } from "@/types/products/products"
import { AppActionError } from "@/types/types"


const productService = new ProductService()

export const createProduct = async (
  values: Omit<ProductType, "id" | "image">,
  imageFile: File
) => {
  return actionHandler(async () => {
    return await productService.createProduct(values, imageFile);
  });
};

export const getProducts = async (): Promise<ProductType[] | AppActionError> => {
  return actionHandler(async () => {
    const products = await productService.getProducts()
    return products
  })
}

export const getProduct = async (id: string) => {
  return actionHandler(async () => {
    const product = await productService.getProduct(id)
    return product
  })
}

export const getAllProducts = async () => {
  return actionHandler(async () => {
    const products = await productService.getAllProducts()
    return products
  })
}

export const updateProduct = async (id: string, updates: any) => {
  return actionHandler(async () => {
    return productService.updateProduct(id, updates)
  })
}

export const deleteProduct = async (id: string) => {
  return actionHandler(async () => {
    return productService.deleteProduct(id)
  })
}