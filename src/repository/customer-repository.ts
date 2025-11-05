// repository/customer-repository.ts
import { createClient } from "@/lib/supabase/server";
import { CustomerType } from "@/types/customers/type";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PublicUser } from "@/types/types";

// Mejor: tipar lo que realmente vuelve de la DB
type DbUser = Omit<PublicUser, "created_at"> & { created_at: string | undefined };

export class CustomersRepository {
  private supabase: SupabaseClient | null = null;

  private async getSupabase() {
    if (!this.supabase) this.supabase = await createClient();
    return this.supabase;
  }

  async getCustomers(): Promise<CustomerType[]> {
    const supabase = await this.getSupabase();

    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, phone, created_at, type_role")
      .eq("type_role", "user")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as DbUser[];

    return rows.map((u): CustomerType => ({
      id: u.id,
      name: u.name ?? (u.email ? u.email.split("@")[0] : "(Sin nombre)"),
      email: u.email ?? "",
      orders: 0,
      spent: 0,
      // 🔧 acá el fix: garantizamos string
      createdAt: u.created_at ?? "", 
    }));
  }
}