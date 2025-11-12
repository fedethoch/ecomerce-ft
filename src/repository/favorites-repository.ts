// repository/favorites-repository.ts
import { createClient } from "@/lib/supabase/server";
import { ProductType } from "@/types/products/products";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FavoritesRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  async getFavoriteProductIds(userId: string): Promise<string[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("user_favorites")
      .select("product_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Error en getFavoriteProductIds:", error.message);
      throw error;
    }
    return data.map((fav) => fav.product_id);
  }

  async getFavoriteProducts(userId: string): Promise<ProductType[]> {
    const supabase = await this.getSupabase();
    
    // --- (MODIFICACIÓN: Consulta corregida) ---
    // El 'product:products(*)' anidado estaba mal.
    // Esta es la forma correcta de hacer el join con la tabla 'products'.
    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        products (
          *
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    // --- (FIN DE LA MODIFICACIÓN) ---

    if (error) {
      console.error("Error en getFavoriteProducts (SQL):", error.message);
      throw error;
    }

    // Mapeamos para extraer solo los datos del producto
    // (el 'data' es una lista de { products: {...} })
    return data
      .map((fav: any) => fav.products) // <-- Cambiado de 'product' a 'products'
      .filter(Boolean) as ProductType[];
  }

  async addFavorite(userId: string, productId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("user_favorites")
      .insert({ user_id: userId, product_id: productId });

    if (error) {
      console.error("Error en addFavorite:", error.message);
      throw error;
    }
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      console.error("Error en removeFavorite:", error.message);
      throw error;
    }
  }
}