import {
  ProductCreationException,
  ProductNotFoundException,
} from "@/exceptions/products/products-exceptions"
import { createClient } from "@/lib/supabase/server"
import { ProductSchema } from "@/lib/validations/ProductSchema"
import { ProductType } from "@/types/products/products"
import { ValidationException } from "@/exceptions/base/base-exceptions"
import type { SupabaseClient } from "@supabase/supabase-js"

export class ProductsRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  async createProduct(values: Omit<ProductType, "id">): Promise<ProductType> {
    const supabase = await this.getSupabase();
    
    const validate_fields = ProductSchema.safeParse(values);

    if (!validate_fields.success) {
      const fieldErrors: Record<string, string[]> = {};

      validate_fields.error.errors.forEach((error) => {
        const field = error.path.join(".");
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      });

      throw new ValidationException(
        validate_fields.error.message,
        fieldErrors,
        "Error de validación en los campos"
      );
    }
    console.log("Insertando en Supabase:", values);
    const { data, error } = await supabase
      .from("products")
      .insert(values)
      .select()
      .single();

    if (error) {
      console.error("Error de Supabase:", error);
      throw new ProductCreationException(
        error.message,
        "Error al crear el producto."
      );
    }
    console.log("Insert exitoso:", data);
    return data as ProductType;
  }

  async getProducts(): Promise<ProductType[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("products")
      .select("*");
      
    if (error) {
      throw new ProductNotFoundException(
        error.message,
        "Error al obtener los productos."
      );
    }

    if (!data) {
      throw new ProductNotFoundException(
        "No se encontraron productos.",
        "No se encontraron productos."
      );
    }

    return data as ProductType[];
  }

  async getProduct(id: string): Promise<ProductType> {
    const supabase = await this.getSupabase();
    
    if (!id) {
      throw new ProductNotFoundException(
        "El ID del producto es requerido.",
        "El ID del producto es requerido."
      );
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new ProductNotFoundException(
        error.message,
        "Error al obtener el producto."
      );
    }

    if (!data) {
      throw new ProductNotFoundException(
        "No se encontró el producto.",
        "No se encontró el producto."
      );
    }

    return data as ProductType;
  }

  async getAllProducts(): Promise<ProductType[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      throw new ProductNotFoundException(
        error.message,
        "Error al obtener los productos."
      );
    }

    if (!data) {
      throw new ProductNotFoundException(
        "No se encontraron productos.",
        "No se encontraron productos."
      );
    }

    return data as ProductType[];
  }

  async updateProduct(id: string, updates: Partial<Omit<ProductType, "id">>) {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as ProductType;
  }

  async deleteProduct(id: string) {
    const supabase = await this.getSupabase();
    
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  }
}