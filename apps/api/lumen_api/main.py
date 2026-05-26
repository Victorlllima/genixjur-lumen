"""Lumen API — FastAPI wrapper para o Scanner.

Endpoints:
    POST /analyze          → JSON com ScanReport completo
    POST /analyze/parecer  → PDF do Parecer Técnico-Jurídico (download direto)
"""

from __future__ import annotations

import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from lumen_scanner.parecer import generate_parecer
from lumen_scanner.scanner import scan

app = FastAPI(
    title="Lumen API",
    description="Análise forense de prompt injection em documentos jurídicos.",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir para o domínio do frontend em produção
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


def _save_upload(upload: UploadFile) -> Path:
    """Salva o upload em arquivo temp e retorna o path."""
    suffix = Path(upload.filename or "doc.pdf").suffix or ".pdf"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix, prefix="lumen_")
    content = upload.file.read()
    tmp.write(content)
    tmp.flush()
    tmp.close()
    return Path(tmp.name)


@app.get("/health")
def health():
    return {"status": "ok", "service": "lumen-api", "version": "0.1.0"}


@app.post(
    "/analyze",
    summary="Analisa um PDF em busca de prompt injection",
    response_description="ScanReport completo em JSON",
)
async def analyze(
    file: UploadFile = File(..., description="Arquivo PDF a analisar"),
    semantic: bool = Query(False, description="Enriquecer com classificação Claude Haiku"),
):
    """Recebe um PDF via multipart/form-data e retorna o relatório de análise em JSON.

    O arquivo é deletado do servidor após a análise (LGPD — minimização de dados).
    Use `?semantic=true` para ativar a camada semântica (requer ANTHROPIC_API_KEY no servidor).
    """
    if not (upload_name := file.filename or ""):
        raise HTTPException(400, "Nome do arquivo não informado.")

    allowed = {".pdf", ".docx"}
    ext = Path(upload_name).suffix.lower()
    if ext not in allowed:
        raise HTTPException(400, f"Formato não suportado: {ext}. Aceitos: {', '.join(allowed)}")

    tmp_path = _save_upload(file)
    try:
        report = scan(str(tmp_path), semantic=semantic)
    finally:
        tmp_path.unlink(missing_ok=True)  # LGPD: delete-after-analyze

    return report.to_dict()


@app.post(
    "/analyze/parecer",
    summary="Analisa um PDF e retorna o Parecer Técnico-Jurídico em PDF",
    response_class=Response,
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Parecer Técnico-Jurídico em PDF",
        }
    },
)
async def analyze_parecer(
    file: UploadFile = File(..., description="Arquivo PDF a analisar"),
    semantic: bool = Query(False, description="Enriquecer com classificação Claude Haiku"),
):
    """Recebe um PDF, analisa e devolve o Parecer Técnico-Jurídico pronto para download.

    O arquivo original é deletado após a análise (LGPD).
    """
    if not (upload_name := file.filename or ""):
        raise HTTPException(400, "Nome do arquivo não informado.")

    ext = Path(upload_name).suffix.lower()
    if ext not in {".pdf", ".docx"}:
        raise HTTPException(400, f"Formato não suportado: {ext}.")

    tmp_path = _save_upload(file)
    try:
        report = scan(str(tmp_path), semantic=semantic)
        pdf_bytes = generate_parecer(report)
    finally:
        tmp_path.unlink(missing_ok=True)

    stem = Path(upload_name).stem
    filename = f"parecer_{stem}_{uuid.uuid4().hex[:8]}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
