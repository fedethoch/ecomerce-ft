// controllers/favorites-controller.ts
"use server";

import { actionHandler } from "@/lib/handlers/actionHandler";
import { FavoritesService } from "@/services/favorites-service";

// Esta acción se llamará UNA VEZ, cuando el usuario cargue la web
export const getFavoriteProductIdsAction = async () => {
  return actionHandler(async () => {
    const service = new FavoritesService();
    return service.getFavoriteProductIds();
  });
};

// Esta acción se llamará desde la PÁGINA DE PERFIL
export const getFavoriteProductsAction = async () => {
  return actionHandler(async () => {
    const service = new FavoritesService();
    return service.getFavoriteProducts();
  });
};

// Esta acción se llamará cada vez que el usuario haga clic en un "corazón"
export const toggleFavoriteAction = async (productId: string) => {
  return actionHandler(async () => {
    const service = new FavoritesService();
    return service.toggleFavorite(productId);
  });
};