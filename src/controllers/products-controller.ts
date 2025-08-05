"use server"

import { actionHandler } from "@/lib/handlers/actionHandler"
import { ProductService } from "@/services/product-service"
import { ProductType } from "@/types/products/products"
import { AppActionError } from "@/types/types"

export const createProduct = async (
  values: Omit<ProductType, "id" | "image">,
  imageFile: File
) => {
  return actionHandler(async () => {
    const productService = new ProductService();
    return await productService.createProduct(values, imageFile);
  });
};

export const getProducts = async (): Promise<ProductType[] | AppActionError> => {
  return actionHandler(async () => {
    const productService = new ProductService();
    return await productService.getProducts();
  });
}

export const getProduct = async (id: string) => {
  return actionHandler(async () => {
    const productService = new ProductService();
    return await productService.getProduct(id);
  });
}

export const getAllProducts = async () => {
  return actionHandler(async () => {
    const productService = new ProductService();
    return await productService.getAllProducts();
  });
}

export const updateProduct = async (id: string, updates: any) => {
  return actionHandler(async () => {
    const productService = new ProductService();
    return await productService.updateProduct(id, updates);
  });
}

export const deleteProduct = async (id: string) => {
  return actionHandler(async () => {
    const productService = new ProductService();
    return await productService.deleteProduct(id);
  });
}