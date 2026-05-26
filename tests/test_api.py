"""Testes de integração da FastAPI — endpoints /health, /analyze, /analyze/parecer."""

import io

import fitz
import pytest
from fastapi.testclient import TestClient

from lumen_api.main import app

client = TestClient(app)


class TestHealth:
    def test_health_ok(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "lumen-api"


class TestAnalyzeEndpoint:
    def test_analyze_clean_pdf(self, pdf_clean):
        with open(pdf_clean, "rb") as f:
            resp = client.post("/analyze", files={"file": ("clean.pdf", f, "application/pdf")})
        assert resp.status_code == 200
        data = resp.json()
        assert data["has_injection"] is False
        assert data["overall_severity"] == "INFO"
        assert data["findings"] == []

    def test_analyze_white_text_pdf(self, pdf_white_text):
        with open(pdf_white_text, "rb") as f:
            resp = client.post("/analyze", files={"file": ("white.pdf", f, "application/pdf")})
        assert resp.status_code == 200
        data = resp.json()
        assert data["has_injection"] is True
        assert data["overall_severity"] == "CRITICAL"
        assert len(data["findings"]) >= 1

    def test_analyze_metadata_pdf(self, pdf_metadata):
        with open(pdf_metadata, "rb") as f:
            resp = client.post("/analyze", files={"file": ("meta.pdf", f, "application/pdf")})
        assert resp.status_code == 200
        data = resp.json()
        assert data["has_injection"] is True

    def test_analyze_returns_sha256(self, pdf_clean):
        with open(pdf_clean, "rb") as f:
            resp = client.post("/analyze", files={"file": ("clean.pdf", f, "application/pdf")})
        data = resp.json()
        assert len(data["sha256"]) == 64

    def test_analyze_unsupported_format(self, tmp_path):
        txt = tmp_path / "doc.txt"
        txt.write_text("hello")
        with open(txt, "rb") as f:
            resp = client.post("/analyze", files={"file": ("doc.txt", f, "text/plain")})
        assert resp.status_code == 400

    def test_analyze_finding_structure(self, pdf_white_text):
        with open(pdf_white_text, "rb") as f:
            resp = client.post("/analyze", files={"file": ("white.pdf", f, "application/pdf")})
        data = resp.json()
        finding = data["findings"][0]
        assert "technique" in finding
        assert "severity" in finding
        assert "confidence" in finding
        assert "text_excerpt" in finding


class TestAnalyzeParecerEndpoint:
    def test_returns_pdf_bytes(self, pdf_clean):
        with open(pdf_clean, "rb") as f:
            resp = client.post("/analyze/parecer", files={"file": ("clean.pdf", f, "application/pdf")})
        assert resp.status_code == 200
        assert resp.headers["content-type"] == "application/pdf"
        assert resp.content[:4] == b"%PDF"

    def test_content_disposition_header(self, pdf_clean):
        with open(pdf_clean, "rb") as f:
            resp = client.post("/analyze/parecer", files={"file": ("clean.pdf", f, "application/pdf")})
        assert "content-disposition" in resp.headers
        assert "parecer" in resp.headers["content-disposition"]

    def test_parecer_is_valid_pdf(self, pdf_white_text):
        with open(pdf_white_text, "rb") as f:
            resp = client.post("/analyze/parecer", files={"file": ("white.pdf", f, "application/pdf")})
        assert resp.status_code == 200
        doc = fitz.open(stream=io.BytesIO(resp.content), filetype="pdf")
        assert doc.page_count >= 1
        doc.close()

    def test_parecer_unsupported_format(self, tmp_path):
        txt = tmp_path / "doc.txt"
        txt.write_text("hello")
        with open(txt, "rb") as f:
            resp = client.post("/analyze/parecer", files={"file": ("doc.txt", f, "text/plain")})
        assert resp.status_code == 400
