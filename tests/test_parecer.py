"""Testes do gerador de Parecer Técnico-Jurídico PDF."""

import io

import fitz
import pytest

from lumen_scanner.parecer import generate_parecer
from lumen_scanner.scanner import scan


class TestGenerateParecer:
    def test_returns_bytes(self, pdf_clean):
        report = scan(str(pdf_clean))
        result = generate_parecer(report)
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_valid_pdf_magic_bytes(self, pdf_clean):
        report = scan(str(pdf_clean))
        pdf_bytes = generate_parecer(report)
        assert pdf_bytes[:4] == b"%PDF"

    def test_saves_to_disk(self, pdf_clean, tmp_path):
        report = scan(str(pdf_clean))
        out = tmp_path / "parecer_test.pdf"
        result = generate_parecer(report, output_path=out)
        assert out.exists()
        assert out.stat().st_size > 0
        # Retorna bytes mesmo salvando em disco
        assert isinstance(result, bytes)

    def test_parecer_is_readable_pdf(self, pdf_clean):
        report = scan(str(pdf_clean))
        pdf_bytes = generate_parecer(report)
        # Verifica que o PDF é abrível pelo PyMuPDF
        doc = fitz.open(stream=io.BytesIO(pdf_bytes), filetype="pdf")
        assert doc.page_count >= 1
        doc.close()

    def test_clean_report_generates_ok(self, pdf_clean):
        """Documento limpo gera parecer sem findings."""
        report = scan(str(pdf_clean))
        assert not report.has_injection
        pdf_bytes = generate_parecer(report)
        assert len(pdf_bytes) > 1000  # PDF real, não vazio

    def test_injection_report_generates_ok(self, pdf_white_text):
        """Documento com injection gera parecer com findings."""
        report = scan(str(pdf_white_text))
        assert report.has_injection
        pdf_bytes = generate_parecer(report)
        assert len(pdf_bytes) > 1000

    def test_combined_report_generates_ok(self, fixtures_dir):
        """PDF com múltiplos findings (combined) não deve explodir."""
        combined = fixtures_dir / "07_combined.pdf"
        if not combined.exists():
            pytest.skip("Fixture 07_combined.pdf não encontrada")
        report = scan(str(combined))
        pdf_bytes = generate_parecer(report)
        assert pdf_bytes[:4] == b"%PDF"

    def test_parecer_contains_sha256(self, pdf_clean):
        """Parecer deve ter o SHA-256 do documento analisado."""
        report = scan(str(pdf_clean))
        pdf_bytes = generate_parecer(report)
        doc = fitz.open(stream=io.BytesIO(pdf_bytes), filetype="pdf")
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()
        # Os primeiros 16 chars do hash devem aparecer no PDF
        assert report.sha256[:16] in full_text
