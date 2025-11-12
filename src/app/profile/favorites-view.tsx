"use client";

import { useState, useEffect } from "react";
import { getFavoriteProductsAction } from "@/controllers/favorites-controller";
import { ProductType } from "@/types/products/products";
import { ProductList } from "@/components/products/product-list";
import { Loader2, HeartCrack } from "lucide-react";
import { AppActionError } from "@/types/types";

const isAppActionError = (value: unknown): value is AppActionError => {
  return (value as AppActionError)?.statusCode !== undefined;
};

export function FavoritesView() {
  const [favorites, setFavorites] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      const result = await getFavoriteProductsAction();

      if (isAppActionError(result)) {
        // --- (MODIFICACIÓN: Añadimos un console.error) ---
        console.error("Error al cargar favoritos (desde el servidor):", result.message);
        setError(result.userMessage || "No se pudo cargar tus favoritos.");
        // --- (FIN DE LA MODIFICACIÓN) ---
      } else {
        setFavorites(result);
      }
      setLoading(false);
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Cargando tus favoritos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
        <HeartCrack className="h-8 w-8 mb-4" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <HeartCrack className="h-8 w-8 mb-4 text-muted-foreground" />
        <p className="text-lg font-medium">No tienes favoritos</p>
        <p className="text-muted-foreground">
          Explora nuestros productos y añade los que más te gusten.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ProductList products={favorites} />
    </div>
  );
}