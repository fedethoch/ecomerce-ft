"use client";

import { ProductType } from "@/types/products/products";
import React, { useState, useEffect } from "react";
import { CartContext } from "./cart-context";

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<ProductType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCartReady, setIsCartReady] = useState(false); // NUEVO

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    setIsCartReady(true); // Marcar como listo después de leer
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Funciones del carrito
  const addItem = (product: ProductType, desiredQty?: number) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === product.id) as any | undefined;
      const availableStock = product.quantity ?? 0; // product.quantity is the stock
      const desired = typeof desiredQty === "number" ? desiredQty : (product as any).quantity ?? 1;

      if (exists) {
        const newQty = Math.min(exists.quantity + desired, availableStock);
        return prev.map((p) =>
          p.id === product.id ? ({ ...(p as any), quantity: newQty, available: availableStock } as any) : p
        );
      }

      const toAddQty = Math.min(desired, availableStock);
      return [...prev, ({ ...(product as any), quantity: toAddQty, available: availableStock } as any)];
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const max = (item as any).available ?? item.quantity;
        const clamped = Math.max(1, Math.min(quantity, max));
        return { ...item, quantity: clamped };
      })
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
