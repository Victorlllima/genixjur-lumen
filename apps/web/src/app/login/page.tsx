"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

const ERROR_LABELS: Record<string, string> = {
  access_denied: "Acesso negado. Tente novamente.",
  otp_expired: "Esse link expirou. Solicite um novo abaixo.",
  exchange_failed: "Falha ao validar o link de autenticação. Solicite um novo.",
  missing_code: "Link de autenticação inválido.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  // Captura erros vindos do callback do Supabase (link expirado etc.)
  useEffect(() => {
    const errParam = searchParams.get("error");
    const errDesc = searchParams.get("error_description");
    if (errParam) {
      setError(ERROR_LABELS[errParam] ?? errDesc ?? errParam);
    }
  }, [searchParams]);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          },
        });
        if (error) throw error;
        setMagicSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) { setError("Informe o e-mail."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setMagicSent(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div className="card fade-up" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        {/* Logo */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <span style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--accent)",
            letterSpacing: "-0.5px",
          }}>LUMEN</span>
          <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>
            Análise forense de documentos jurídicos
          </div>
        </div>

        {magicSent ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
            <div style={{ color: "var(--text)", fontWeight: 600, marginBottom: 8 }}>
              Verifique seu e-mail
            </div>
            <div style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>
              Enviamos um link de acesso para <b>{email}</b>.<br />
              Pode fechar esta aba.
            </div>
          </div>
        ) : (
          <>
            {/* Abas login/registro */}
            <div style={{
              display: "flex",
              gap: 4,
              background: "var(--bg)",
              borderRadius: 8,
              padding: 4,
              marginBottom: 20,
            }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 6,
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: mode === m ? "var(--card-hover)" : "transparent",
                    color: mode === m ? "var(--text)" : "var(--text-2)",
                  }}
                >
                  {m === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="voce@escritorio.com.br"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 13,
                  color: "var(--critical)",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: "100%", marginTop: 4 }}
              >
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "16px 0",
            }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>ou</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-ghost"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35.9 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
              </svg>
              Entrar com Google
            </button>

            <button
              type="button"
              onClick={handleMagicLink}
              className="btn-ghost"
              disabled={loading}
              style={{ width: "100%" }}
            >
              Entrar com link mágico ✨
            </button>
          </>
        )}
      </div>

      <div style={{
        position: "fixed",
        bottom: 16,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 11,
        color: "var(--text-3)",
      }}>
        <a href="/privacy" style={{ color: "inherit", marginRight: 16, textDecoration: "none" }}>Política de Privacidade</a>
        <a href="/terms" style={{ color: "inherit", textDecoration: "none" }}>Termos de Uso</a>
      </div>
    </div>
  );
}
