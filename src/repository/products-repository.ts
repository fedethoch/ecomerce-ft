import {
  ProductCreationException,
  ProductNotFoundException,
} from "@/exceptions/products/products-exceptions"
import { createClient } from "@/lib/supabase/server"
import { ProductSchema } from "@/lib/validations/ProductSchema"
import { ProductType } from "@/types/products/products"
import { ValidationException } from "@/exceptions/base/base-exceptions"
import type { SupabaseClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from 'uuid';

function fromRow(prod: any): ProductType {
  return {
    id: String(prod.id),
    name: String(prod.name ?? ""),
    price: Number(prod.price ?? 0),
    originalPrice: prod.original_price ?? undefined,
    quantity: Number(prod.quantity ?? 0),
    category: String(prod.category ?? ""),
    isNew: !!(prod.is_new ?? false),
    isSale: !!(prod.is_sale ?? false),
    isOutstanding: !!(prod.is_outstanding ?? false),
    sizes: Array.isArray(prod.sizes) ? prod.sizes : [],
    description: String(prod.description ?? ""),
    imagePaths: Array.isArray(prod.image_paths) ? prod.image_paths : [], // 👈 tu tabla usa image_paths
    weightGrams: prod.weight_grams ?? undefined,
  }
}

// Util para mapear camel -> snake (escritura a DB)
function toRow(updates: Partial<Omit<ProductType, "id">>) {
  const out: Record<string, any> = {}

  if ("name" in updates) out.name = updates.name
  if ("price" in updates) out.price = updates.price
  if ("originalPrice" in updates) out.original_price = updates.originalPrice
  if ("quantity" in updates) out.quantity = updates.quantity
  if ("category" in updates) out.category = updates.category
  if ("isNew" in updates) out.is_new = updates.isNew
  if ("isSale" in updates) out.is_sale = updates.isSale
  if ("isOutstanding" in updates) out.is_outstanding = updates.isOutstanding
  if ("sizes" in updates) out.sizes = updates.sizes
  if ("description" in updates) out.description = updates.description
  if ("imagePaths" in updates) out.image_paths = updates.imagePaths // 👈 consistente con createProduct
  if ("weightGrams" in updates) out.weight_grams = updates.weightGrams

  return out
}







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
    const id = uuidv4();
    const validate_fields = ProductSchema.safeParse(values);
    console.log("Datos recibidos para crear producto:", values);
    const productWithId = {
      ...values,
      id
    };
    if (!validate_fields.success) {
      const fieldErrors: Record<string, string[]> = {};
      
      validate_fields.error.errors.forEach((error) => {
        const field = error.path.join(".");
        fieldErrors[field] = [...(fieldErrors[field] || []), error.message];
      });
      
      throw new ValidationException(
        "Error de validación",
        fieldErrors,
        "Verifica los campos del producto"
      );
    }

    // Preparar datos para Supabase (mapeo de nombres de campos)
    const insertData = {
      id,
      name: values.name,
      price: values.price,
      original_price: values.originalPrice,
      quantity: values.quantity,
      category: values.category,
      is_new: values.isNew,
      is_sale: values.isSale,
      is_outstanding: values.isOutstanding,
      sizes: values.sizes,
      description: values.description,
      image_paths: values.imagePaths
    };

    console.log("Insertando en Supabase:", insertData);
    const { data, error } = await supabase
      .from("products")
      .insert(insertData)
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
    // Mapeo aquí:
    const mapped = data.map(fromRow)
    
    return mapped
}

  async getProduct(id: string): Promise<ProductType> {
    const supabase = await this.getSupabase();
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
    // Mapeo aquí:
    return {
      ...data,
      imagePaths: data.image_paths || [],
    } as ProductType;
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

    // Mapeo aquí:
    const mapped = data.map(fromRow)
    return mapped;
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