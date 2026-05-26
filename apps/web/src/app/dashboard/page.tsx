import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import type { AnalysisRow } from "@/lib/types/database";
import { FileSearch, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const SEV_CLASS: Record<string, string> = {
  CRITICAL: "badge-critical",
  HIGH: "badge-high",
  MEDIUM: "badge-medium",
  LOW: "badge-low",
  INFO: "badge-info",
};

const SEV_LABEL: Record<string, string> = {
  CRITICAL: "Crítico",
  HIGH: "Alto",
  MEDIUM: "Médio",
  LOW: "Baixo",
  INFO: "Limpo",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analysesRaw } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const analyses = analysesRaw as AnalysisRow[] | null;
  const total = analyses?.length ?? 0;
  const withInjection = analyses?.filter((a) => a.has_injection).length ?? 0;
  const clean = total - withInjection;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar userEmail={user.email} />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Análises Forenses
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Histórico de documentos verificados pelo Lumen Scanner
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total analisados", value: total, icon: FileSearch, color: "var(--text)" },
            { label: "Com injection", value: withInjection, icon: AlertTriangle, color: "var(--high)" },
            { label: "Documentos limpos", value: clean, icon: CheckCircle, color: "var(--success)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "var(--font-mono, monospace)" }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{label}</div>
                </div>
                <Icon size={20} color={color} style={{ opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Botão nova análise */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "flex-end" }}>
          <Link href="/analyze" className="btn-primary" style={{ textDecoration: "none" }}>
            + Nova análise
          </Link>
        </div>

        {/* Lista de análises */}
        {!analyses || analyses.length === 0 ? (
          <div className="card" style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-2)",
          }}>
            <FileSearch size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Nenhuma análise ainda</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>
              Faça o upload de um PDF para verificar se há prompt injection.
            </div>
            <Link href="/analyze" className="btn-primary" style={{ textDecoration: "none" }}>
              Analisar primeiro documento
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/analysis/${analysis.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--text-3)";
                    (e.currentTarget as HTMLElement).style.background = "var(--card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--card)";
                  }}
                >
                  {/* Status icon */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: analysis.has_injection
                      ? "rgba(249,115,22,0.12)"
                      : "rgba(34,197,94,0.12)",
                    flexShrink: 0,
                  }}>
                    {analysis.has_injection
                      ? <AlertTriangle size={16} color="var(--high)" />
                      : <CheckCircle size={16} color="var(--success)" />
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--text)",
                    }}>
                      {analysis.file_name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2, display: "flex", gap: 12 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={10} />
                        {formatDate(analysis.created_at)}
                      </span>
                      <span>{analysis.page_count} pág.</span>
                      <span>{formatBytes(analysis.file_size_bytes)}</span>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                        {analysis.sha256.slice(0, 10)}…
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className={`badge ${SEV_CLASS[analysis.overall_severity] || "badge-info"}`}>
                    {SEV_LABEL[analysis.overall_severity] || analysis.overall_severity}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
