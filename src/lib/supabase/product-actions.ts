import { createClient } from "@/lib/supabase/server";
import { publicSupabase } from "@/lib/supabase/public";


export async function getProductById(id: string) {
  const supabase = await createClient(); // Añade await aquí
  
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Error al obtener producto: ${error.message}`);
  }

  return product;
}

export async function getAllProductIds() {
  const supabase = await createClient(); // Añade await aquí
  
  const { data: products, error } = await supabase
    .from("products")
    .select("id");

  if (error) {
    throw new Error(`Error al obtener IDs de productos: ${error.message}`);
  }

  return products.map(p => ({ id: p.id }));
}

export async function getAllProductIdsSSG() {
  const { data: products, error } = await publicSupabase
    .from("products")
    .select("id");

  if (error) {
    throw new Error(`Error al obtener IDs de productos: ${error.message}`);
  }

  return products.map(p => ({ id: p.id }));
}

export async function getRelatedProducts(category: string, currentId: string, limit = 4) {
  const supabase = await createClient(); // Añade await aquí
  
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", currentId)
    .limit(limit);

  if (error) {
    throw new Error(`Error al obtener productos relacionados: ${error.message}`);
  }

  return products;
}