import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductType } from "@/types/products/products"
// Tipo de cada producto en el carrito (puedes ajustarlo según tu modelo)


// Tipo del contexto: qué datos y funciones expondrá
export type CartContextType = {
  cart: ProductType[];
  addItem: (item: ProductType) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  
};

// Creamos el contexto vacío
export const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }
  return context;
};

