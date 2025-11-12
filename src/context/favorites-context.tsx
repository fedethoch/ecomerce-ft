// context/favorites-context.tsx
"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getFavoriteProductIdsAction,
  toggleFavoriteAction,
} from "@/controllers/favorites-controller";
import { createClient } from "@/lib/supabase/client";
import { AppActionError } from "@/types/types"; // Asumo que tienes este tipo
import { toast } from "sonner";

// Definimos lo que nuestro contexto proveerá
interface FavoritesContextType {
  favoriteIds: string[]; // Lista de IDs de productos favoritos
  toggleFavorite: (productId: string) => void; // Función para añadir/quitar
  isLoading: boolean;
}

// Creamos el contexto
export const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

// Helper para el manejo de errores
const isAppActionError = (value: unknown): value is AppActionError => {
  return (value as AppActionError)?.statusCode !== undefined;
};

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Función para cargar los favoritos del usuario logueado
  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    const data = await getFavoriteProductIdsAction();
    if (isAppActionError(data)) {
      // No mostramos error si el usuario no está logueado
      if (data.statusCode !== 401) {
        toast.error("No se pudieron cargar tus favoritos.");
      }
      setFavoriteIds([]);
    } else {
      setFavoriteIds(data);
    }
    setIsLoading(false);
  }, []);

  // Efecto para cargar favoritos cuando el usuario inicia/cierra sesión
  useEffect(() => {
    fetchFavorites(); // Carga inicial

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          fetchFavorites(); // Cargar favoritos al iniciar sesión
        }
        if (event === "SIGNED_OUT") {
          setFavoriteIds([]); // Limpiar favoritos al cerrar sesión
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchFavorites, supabase]);

  // Función para añadir/quitar un favorito
  const toggleFavorite = async (productId: string) => {
    let oldFavorites = [...favoriteIds];
    let newFavorites: string[];

    // 1. Actualización Optimista (UI instantánea)
    if (favoriteIds.includes(productId)) {
      newFavorites = favoriteIds.filter((id) => id !== productId);
    } else {
      newFavorites = [...favoriteIds, productId];
    }
    setFavoriteIds(newFavorites);

    // 2. Llamada al Servidor (en segundo plano)
    try {
      const result = await toggleFavoriteAction(productId);
      if (isAppActionError(result)) throw result;

      // Opcional: mostrar un toast de éxito
      if (result.added) {
        toast.success("Añadido a favoritos");
      } else {
        toast.info("Quitado de favoritos");
      }
    } catch (err: any) {
      // 3. Revertir si hay un error
      setFavoriteIds(oldFavorites); // Vuelve al estado anterior
      if (err.statusCode === 401) {
        toast.error("Debes iniciar sesión para añadir favoritos.");
      } else {
        toast.error("No se pudo actualizar tus favoritos.");
      }
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, toggleFavorite, isLoading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};