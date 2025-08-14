"use server"

import { actionHandler } from "@/lib/handlers/actionHandler"
import { ProductService } from "@/services/product-service"
import { ProductType } from "@/types/products/products"
import { AppActionError } from "@/types/types"

export const createProduct = async (
  values: Omit<ProductType, "id" | "imagePaths">,
  imageFiles: File[] | File // <-- acepta ambos
) => {
  return actionHandler(async () => {
    const productService = new ProductService();
    // Normaliza a array antes de pasar
    const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
    return await productService.createProduct(values, filesArray);
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