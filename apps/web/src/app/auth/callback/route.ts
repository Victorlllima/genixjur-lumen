import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticação Supabase.
 *
 * Endpoint chamado quando o usuário clica em:
 *  - Magic Link
 *  - Confirmação de email após signup
 *  - Reset de senha
 *  - OAuth (Google, GitHub, etc.) após autorização no provider
 *
 * Recebe `code` na query string e troca por uma sessão (cookies httpOnly).
 * Depois redireciona para `next` (default: /dashboard).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Supabase mandou erro no fluxo (link expirado, etc.) — redireciona pra login com mensagem
  if (error) {
    const params = new URLSearchParams({ error, error_description: errorDescription ?? "" });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    const params = new URLSearchParams({
      error: "exchange_failed",
      error_description: exchangeError.message,
    });
    return NextResponse.redirect(`${origin}/login?${params.toString()}`);
  }

  // Nenhum código nem erro — fluxo malformado
  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
