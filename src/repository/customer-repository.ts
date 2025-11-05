// repository/customer-repository.ts
import { createClient } from "@/lib/supabase/server";
import { CustomerType } from "@/types/customers/type";
import type { SupabaseClient } from "@supabase/supabase-js";
// import { PublicUser } from "@/types/types"; // Ya no es necesario

export class CustomersRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) this.supabase = await createClient();
    return this.supabase;
  }

  async getCustomers(): Promise<CustomerType[]> {
    const supabase = await this.getSupabase();

    // --- MODIFICACIÓN AQUÍ ---
    // Llamamos a la función RPC que creamos en la base de datos
    const { data, error } = await supabase
      .rpc('get_customers_with_purchases');

    if (error) {
      console.error("Error al llamar RPC get_customers_with_purchases:", error);
      throw new Error(error.message);
    }

    // La data ya viene en el formato de CustomerType,
    // incluyendo 'orders' y 'spent' calculados.
    return (data ?? []) as CustomerType[];
    // --- FIN DE LA MODIFICACIÓN ---
  }
}