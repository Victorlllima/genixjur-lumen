import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Raiz: redireciona para dashboard (logado) ou login (não logado)
// O middleware já faz isso, mas mantemos como fallback
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  redirect(user ? "/dashboard" : "/login");
}
