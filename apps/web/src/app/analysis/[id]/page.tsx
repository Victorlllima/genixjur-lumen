import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import type { AnalysisRow, FindingRow } from "@/lib/types/database";
import {
  AlertTriangle, CheckCircle, Download, ArrowLeft,
  FileText, Hash, Calendar, Clock, Layers,
} from "lucide-react";

const SEV_CLASS: Record<string, string> = {
  CRITICAL: "badge-critical", HIGH: "badge-high",
  MEDIUM: "badge-medium", LOW: "badge-low", INFO: "badge-info",
};
const SEV_LABEL: Record<string, string> = {
  CRITICAL: "Crítico", HIGH: "Alto", MEDIUM: "Médio", LOW: "Baixo", INFO: "Limpo",
};
const TECHNIQUE_LABEL: Record<string, string> = {
  white_text: "Texto em cor invisível",
  micro_font: "Fonte microscópica",
  off_page: "Texto fora da página",
  zero_width_chars: "Caracteres invisíveis",
  metadata: "Injeção via metadados",
  ocg_layer: "Camada oculta (OCG)",
};
const VERDICT_LABEL: Record<string, { text: string; color: string }> = {
  injection: { text: "Injeção confirmada", color: "var(--critical)" },
  watermark_legitimo: { text: "Watermark legítimo", color: "var(--success)" },
  falso_positivo: { text: "Falso positivo", color: "var(--text-2)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface Props { params: Promise<{ id: string }> }

export default async function AnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: analysisRaw } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysisRaw) notFound();
  const analysis = analysisRaw as AnalysisRow;

  const { data: findingsRaw } = await supabase
    .from("findings")
    .select("*")
    .eq("analysis_id", id)
    .order("severity", { ascending: true });

  const findings = findingsRaw as FindingRow[] | null;

  const isInjection = analysis.has_injection;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar userEmail={user.email} />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 40px", maxWidth: 900 }}>
        {/* Voltar */}
        <Link href="/dashboard" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          color: "var(--text-2)",
          textDecoration: "none",
          marginBottom: 24,
          transition: "color 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-2)")}
        >
          <ArrowLeft size={14} /> Voltar
        </Link>

        {/* Veredito */}
        <div className="card fade-up" style={{
          padding: "24px 28px",
          marginBottom: 24,
          borderColor: isInjection ? "rgba(249,115,22,0.3)" : "rgba(34,197,94,0.3)",
          background: isInjection
            ? "rgba(249,115,22,0.05)"
            : "rgba(34,197,94,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {isInjection
              ? <AlertTriangle size={28} color="var(--high)" />
              : <CheckCircle size={28} color="var(--success)" />
            }
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 2 }}>
                {isInjection ? "Indícios de Manipulação" : "Documento Limpo"}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                {isInjection
                  ? `${findings?.length ?? 0} ocorrência(s) detectada(s) · Severidade: `
                  : "Nenhum padrão de prompt injection identificado · Severidade: "
                }
                <span className={`badge ${SEV_CLASS[analysis.overall_severity]}`} style={{ marginLeft: 4 }}>
                  {SEV_LABEL[analysis.overall_severity]}
                </span>
              </div>
            </div>

            {/* Botão download parecer */}
            <div style={{ marginLeft: "auto" }}>
              <a
                href={`/api/scanner/analyze/parecer`}
                onClick={(e) => {
                  e.preventDefault();
                  alert("Para baixar o Parecer, re-analise o documento. O arquivo original não é armazenado (LGPD).");
                }}
                className="btn-ghost"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
              >
                <Download size={14} />
                Baixar Parecer PDF
              </a>
            </div>
          </div>
        </div>

        {/* Metadados do documento */}
        <div className="card" style={{ padding: "20px 24px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Identificação do Documento
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 24px" }}>
            {[
              { icon: FileText, label: "Arquivo", value: analysis.file_name },
              { icon: Layers, label: "Páginas", value: `${analysis.page_count} página(s)` },
              { icon: FileText, label: "Tamanho", value: formatBytes(analysis.file_size_bytes) },
              { icon: Clock, label: "Duração da análise", value: `${analysis.duration_ms} ms` },
              { icon: Calendar, label: "Analisado em", value: formatDate(analysis.scanned_at) },
              { icon: Hash, label: "SHA-256", value: null, mono: analysis.sha256 },
            ].map(({ icon: Icon, label, value, mono }) => (
              <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icon size={14} color="var(--text-3)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{label}</div>
                  {mono ? (
                    <div className="font-mono" style={{ fontSize: 11, color: "var(--text-2)", wordBreak: "break-all" }}>
                      {mono}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Findings */}
        {findings && findings.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Ocorrências Detectadas
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {findings.map((f, i) => {
                const verdict = f.semantic_verdict ? VERDICT_LABEL[f.semantic_verdict] : null;
                return (
                  <div
                    key={f.id}
                    className="card fade-up"
                    style={{ padding: "20px 24px", animationDelay: `${i * 60}ms` }}
                  >
                    {/* Header da ocorrência */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)" }}>
                        #{i + 1}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>
                        {TECHNIQUE_LABEL[f.technique] || f.technique}
                      </span>
                      <span className={`badge ${SEV_CLASS[f.severity]}`}>
                        {SEV_LABEL[f.severity]}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-2)" }}>
                        {Math.round(f.confidence * 100)}% confiança
                      </span>
                    </div>

                    {/* Veredito semântico */}
                    {verdict && (
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        marginBottom: 12,
                        border: `1px solid ${verdict.color}30`,
                        color: verdict.color,
                        background: `${verdict.color}10`,
                      }}>
                        IA: {verdict.text}
                        {f.semantic_confidence && (
                          <span style={{ opacity: 0.7 }}>
                            · {Math.round(f.semantic_confidence * 100)}%
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metadados */}
                    <div style={{ display: "flex", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
                      {f.page && (
                        <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                          <span style={{ color: "var(--text-3)" }}>Página: </span>{f.page}
                        </div>
                      )}
                      {f.bbox && (
                        <div className="font-mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                          bbox: {JSON.stringify(f.bbox)}
                        </div>
                      )}
                    </div>

                    {/* Texto detectado */}
                    {f.text_excerpt && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>
                          Trecho detectado:
                        </div>
                        <div style={{
                          background: "var(--bg)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontSize: 12,
                          fontFamily: "var(--font-mono, monospace)",
                          color: "var(--text-2)",
                          lineHeight: 1.6,
                          wordBreak: "break-word",
                        }}>
                          {f.text_excerpt}
                        </div>
                      </div>
                    )}

                    {/* Reasoning IA */}
                    {f.semantic_reasoning && (
                      <div style={{
                        fontSize: 12,
                        color: "var(--text-2)",
                        fontStyle: "italic",
                        lineHeight: 1.6,
                        borderLeft: "2px solid var(--border)",
                        paddingLeft: 12,
                      }}>
                        {f.semantic_reasoning}
                      </div>
                    )}

                    {/* Notas técnicas */}
                    {f.notes && (
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 8 }}>
                        {f.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
