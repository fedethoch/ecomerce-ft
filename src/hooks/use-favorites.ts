// hooks/use-favorites.ts
"use client";
import { useContext } from "react";
import { FavoritesContext } from "@/context/favorites-context";

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites debe ser usado dentro de un FavoritesProvider");
  }
  return context;
};