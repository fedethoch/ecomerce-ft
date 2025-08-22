"use client";

import { useState, useEffect } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct as getProductController,
} from "@/controllers/products-controller";
import { actionErrorHandler } from "@/lib/handlers/actionErrorHandler";
import type { ProductType } from "@/types/products/products";
import { AppActionError } from "@/types/types";

export function useProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAppActionError = (value: unknown): value is AppActionError => {
    return (value as AppActionError)?.statusCode !== undefined;
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await actionErrorHandler(getProducts);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar productos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener un solo producto
  const getProduct = async (id: string): Promise<ProductType | null> => {
    try {
      // NO uses setLoading aquí
      const data = await actionErrorHandler(() => getProductController(id));
      return data;
    } catch (err) {
      setError("Error al cargar el producto");
      console.error(err);
      return null;
    }
    // NO uses setLoading aquí
  };

  const addProduct = async (
    productData: Omit<ProductType, "id" | "imagePaths">,
    imageFiles: File[] | File
  ) => {
    try {
      const filesArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      const newProduct = await createProduct(productData, filesArray);

      console.log("Producto creado:", newProduct);

      if (isAppActionError(newProduct)) {
        setError(newProduct.userMessage || newProduct.message);
        return;
      }

      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error("Error detallado:", err);
      setError("Error al crear producto");
      throw err;
    }
  };

  const editProduct = async (
    id: string,
    updates: Partial<Omit<ProductType, "id">>
  ) => {
    try {
      const updatedProduct = await updateProduct(id, updates);

      if (isAppActionError(updatedProduct)) {
        setError(updatedProduct.userMessage || updatedProduct.message);
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? updatedProduct : p))
      );
      return updatedProduct;
    } catch (err) {
      setError("Error al actualizar producto");
      throw err;
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Error al eliminar producto");
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    editProduct,
    removeProduct,
    getProduct, // Nueva función añadida
  };
}
