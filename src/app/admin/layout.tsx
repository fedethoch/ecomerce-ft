import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/admin/app-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect("/");
  }

  const { data: userData, error } = await supabase
    .from("users")
    .select("type_role")
    .eq("id", authData.user.id)
    .single();

  if (error || !userData || userData.type_role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <AppSidebar />
      <main className="">{children}</main>
    </div>
  );
}
