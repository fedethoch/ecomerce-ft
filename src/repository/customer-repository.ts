import { createClient } from "@/lib/supabase/server";
import { CustomerType } from "@/types/customers/type";
import type { SupabaseClient } from "@supabase/supabase-js";

export class CustomersRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient();
    }
    return this.supabase;
  }

  async getCustomers(): Promise<CustomerType[]> {
    const supabase = await this.getSupabase();
    
    const { data, error } = await supabase
      .from("customers") // Corregido: .from() no .form()
      .select("id, name, email, orders, spent, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Tipado explícito para customer
    return (data || []).map((customer: any) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      orders: customer.orders,
      spent: customer.spent,
      createdAt: customer.created_at
    }));
  }
}