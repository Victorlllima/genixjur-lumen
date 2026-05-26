"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AnalyzeStep = "idle" | "uploading" | "scanning" | "saving" | "done" | "error";

export default function AnalyzePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<AnalyzeStep>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [semantic, setSemantic] = useState(false);
  const [error, setError] = useState("");

  async function runAnalysis(file: File) {
    setStep("uploading");
    setError("");
    try {
      // 1. Envia para a API do Scanner
      setStep("scanning");
      const form = new FormData();
      form.append("file", file);
      const apiUrl = semantic ? "/api/scanner/analyze?semantic=true" : "/api/scanner/analyze";
      const res = await fetch(apiUrl, { method: "POST", body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Erro HTTP ${res.status}`);
      }
      const report = await res.json();

      // 2. Salva no Supabase
      setStep("saving");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada — faça login novamente.");

      const { data: analysisRaw, error: insertError } = await supabase
        .from("analyses")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_size_bytes: file.size,
          sha256: report.sha256,
          page_count: report.page_count,
          has_injection: report.has_injection,
          overall_severity: report.overall_severity,
          duration_ms: report.duration_ms,
          semantic_used: semantic,
          scanned_at: report.scanned_at,
        } as never)
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const analysis = analysisRaw as any;

      // 3. Salva os findings
      if (report.findings?.length > 0) {
        const findingsPayload = report.findings.map((f: Record<string, unknown>) => ({
          analysis_id: analysis.id,
          technique: f.technique,
          severity: f.severity,
          confidence: f.confidence,
          page: f.page ?? null,
          bbox: f.bbox ?? null,
          text_excerpt: f.text_excerpt ?? null,
          reconstructed_command: f.reconstructed_command ?? null,
          notes: f.notes ?? null,
          semantic_verdict: f.semantic_verdict ?? null,
          semantic_confidence: f.semantic_confidence ?? null,
          semantic_reasoning: f.semantic_reasoning ?? null,
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("findings").insert(findingsPayload as never[]);
      }

      setStep("done");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTimeout(() => router.push(`/analysis/${(analysis as any).id}`), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setStep("error");
    }
  }

  function handleFileSelect(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Apenas PDFs são aceitos.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Arquivo muito grande (máx. 50 MB).");
      return;
    }
    setSelectedFile(file);
    setError("");
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const isProcessing = ["uploading", "scanning", "saving"].includes(step);

  const stepLabel: Record<AnalyzeStep, string> = {
    idle: "",
    uploading: "Enviando arquivo...",
    scanning: "Executando análise forense...",
    saving: "Salvando relatório...",
    done: "Análise concluída! Redirecionando...",
    error: "",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{ marginLeft: 220, flex: 1, padding: "32px 40px", maxWidth: 760 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Nova Análise</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Faça upload de um PDF para verificar prompt injection em até 10 segundos.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`dropzone fade-up ${dragOver ? "drag-over" : ""}`}
          style={{
            padding: selectedFile ? "28px 32px" : "56px 32px",
            textAlign: "center",
            marginBottom: 20,
            transition: "all 0.2s",
          }}
          onClick={() => !isProcessing && fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          {!selectedFile ? (
            <>
              <Upload size={36} color="var(--text-3)" style={{ margin: "0 auto 16px" }} />
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Arraste o PDF aqui ou clique para selecionar
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                Suporte a PDF · Máx. 50 MB
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
              <FileText size={28} color="var(--accent)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
                  {(selectedFile.size / 1024).toFixed(0)} KB
                  {!isProcessing && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      style={{
                        marginLeft: 12,
                        background: "none",
                        border: "none",
                        color: "var(--text-3)",
                        cursor: "pointer",
                        fontSize: 12,
                        textDecoration: "underline",
                      }}
                    >
                      Trocar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opção Semantic */}
        <div className="card" style={{ padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <input
            type="checkbox"
            id="semantic"
            checked={semantic}
            onChange={(e) => setSemantic(e.target.checked)}
            disabled={isProcessing}
            style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
          />
          <label htmlFor="semantic" style={{ cursor: "pointer", flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              Análise semântica com IA{" "}
              <span style={{
                fontSize: 10,
                padding: "2px 6px",
                background: "rgba(232,68,10,0.15)",
                color: "var(--accent)",
                borderRadius: 4,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}>
                RECOMENDADO
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>
              Claude Haiku valida cada ocorrência e elimina falsos positivos. +2-4s na análise.
            </div>
          </label>
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
          }}>
            <AlertCircle size={16} color="var(--critical)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: "var(--critical)" }}>{error}</span>
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            background: "rgba(232,68,10,0.08)",
            border: "1px solid rgba(232,68,10,0.2)",
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <Loader2 size={16} color="var(--accent)" style={{ animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
              {stepLabel[step]}
            </span>
          </div>
        )}

        {step === "done" && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: 10,
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 16 }}>✓</span>
            <span style={{ fontSize: 13, color: "var(--success)", fontWeight: 500 }}>
              {stepLabel.done}
            </span>
          </div>
        )}

        {/* Botão */}
        <button
          className="btn-primary"
          disabled={!selectedFile || isProcessing || step === "done"}
          onClick={() => selectedFile && runAnalysis(selectedFile)}
          style={{ width: "100%", padding: "14px 0", fontSize: 15 }}
        >
          {isProcessing ? "Analisando..." : "Iniciar análise forense"}
        </button>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    </div>
  );
}
