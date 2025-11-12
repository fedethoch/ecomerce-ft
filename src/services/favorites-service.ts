// services/favorites-service.ts
import { FavoritesRepository } from "@/repository/favorites-repository";
import { ProductType } from "@/types/products/products";
import { AuthService } from "./auth-service";
import { UnauthorizedProductAccessException } from "@/exceptions/products/products-exceptions"; // Reutilizamos esta excepción

export class FavoritesService {
  private repository = new FavoritesRepository();
  private authService = new AuthService();

  private async getUserId(): Promise<string> {
    const user = await this.authService.getUser();
    if (!user) {
      throw new UnauthorizedProductAccessException(
        "No autenticado",
        "Debes iniciar sesión para gestionar favoritos."
      );
    }
    return user.id;
  }

  async getFavoriteProductIds(): Promise<string[]> {
    const userId = await this.getUserId();
    return this.repository.getFavoriteProductIds(userId);
  }

  async getFavoriteProducts(): Promise<ProductType[]> {
    const userId = await this.getUserId();
    return this.repository.getFavoriteProducts(userId);
  }

  // Esta función es la que usarán los botones de "corazón"
  async toggleFavorite(productId: string): Promise<{ added: boolean }> {
    const userId = await this.getUserId();
    // Vemos si ya existe
    const currentFavorites = await this.repository.getFavoriteProductIds(userId);
    const isFavorited = currentFavorites.includes(productId);

    if (isFavorited) {
      // Si ya existe, lo quitamos
      await this.repository.removeFavorite(userId, productId);
      return { added: false };
    } else {
      // Si no existe, lo añadimos
      await this.repository.addFavorite(userId, productId);
      return { added: true };
    }
  }
}