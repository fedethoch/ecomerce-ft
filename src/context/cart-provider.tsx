"use client"

import { ProductType } from "@/types/products/products"
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
  const addItem = (item: ProductType) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + item.quantity  } : p
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addItem, removeItem, updateQuantity, clearCart, isOpen, setIsOpen, isCartReady }}
    >
      {children}
    </CartContext.Provider>
  );
};

