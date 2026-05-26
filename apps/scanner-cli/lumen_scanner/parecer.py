"""Geração do Parecer Técnico-Jurídico em PDF — entregável do Lumen Scanner."""

from __future__ import annotations

import io
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .models import Finding, Severity, ScanReport, Technique

# ─── Cores Lumen ─────────────────────────────────────────────────────────────

_ORANGE = colors.HexColor("#E8440A")
_BLACK = colors.HexColor("#0D0D0D")
_DARK = colors.HexColor("#1A1A1A")
_MID = colors.HexColor("#4A4A4A")
_LIGHT = colors.HexColor("#F5F5F5")
_BORDER = colors.HexColor("#E0E0E0")
_WHITE = colors.white

_SEV_COLORS = {
    Severity.CRITICAL: colors.HexColor("#DC2626"),
    Severity.HIGH: colors.HexColor("#EA580C"),
    Severity.MEDIUM: colors.HexColor("#CA8A04"),
    Severity.LOW: colors.HexColor("#2563EB"),
    Severity.INFO: colors.HexColor("#059669"),
}

# ─── Nomes em PT-BR ──────────────────────────────────────────────────────────

_TECHNIQUE_LABELS = {
    Technique.WHITE_TEXT: "Texto em cor invisível",
    Technique.MICRO_FONT: "Fonte em tamanho microscópico",
    Technique.OFF_PAGE: "Texto fora da área visível",
    Technique.ZERO_WIDTH_CHARS: "Caracteres de largura zero",
    Technique.METADATA: "Injeção via metadados do documento",
    Technique.OCG_LAYER: "Camada de conteúdo oculta (OCG)",
}

_TECHNIQUE_DESC = {
    Technique.WHITE_TEXT: (
        "Texto escrito com cor idêntica ou muito próxima ao fundo branco da página, "
        "tornando-o invisível ao leitor humano mas legível por sistemas de processamento de texto e IA."
    ),
    Technique.MICRO_FONT: (
        "Texto inserido com tamanho de fonte inferior a 2pt — imperceptível a olho nu mesmo "
        "com zoom, mas extraído integralmente por parsers de PDF."
    ),
    Technique.OFF_PAGE: (
        "Texto posicionado fora dos limites de visualização da página (cropbox/mediabox), "
        "excluído da impressão mas presente no stream de conteúdo e legível por extratores de texto."
    ),
    Technique.ZERO_WIDTH_CHARS: (
        "Caracteres Unicode de largura nula (U+200B, U+00AD, etc.) intercalados ao texto visível, "
        "formando mensagens ocultas detectáveis apenas via análise de bytes brutos."
    ),
    Technique.METADATA: (
        "Instruções injetadas nos campos de metadados do arquivo PDF (/Title, /Subject, /Keywords, "
        "/Author etc.), processados automaticamente por ferramentas de IA ao indexar o documento."
    ),
    Technique.OCG_LAYER: (
        "Grupos de conteúdo opcional (Optional Content Groups) configurados como ocultos por padrão, "
        "permitindo texto presente no arquivo mas não renderizado na visualização padrão."
    ),
}

_SEV_LABELS = {
    Severity.CRITICAL: "CRÍTICO",
    Severity.HIGH: "ALTO",
    Severity.MEDIUM: "MÉDIO",
    Severity.LOW: "BAIXO",
    Severity.INFO: "INFO",
}


# ─── Estilos ─────────────────────────────────────────────────────────────────

def _build_styles():
    base = getSampleStyleSheet()

    styles = {}

    styles["title"] = ParagraphStyle(
        "title",
        fontName="Helvetica-Bold",
        fontSize=18,
        textColor=_BLACK,
        spaceAfter=4,
        alignment=TA_CENTER,
    )
    styles["subtitle"] = ParagraphStyle(
        "subtitle",
        fontName="Helvetica",
        fontSize=10,
        textColor=_MID,
        spaceAfter=2,
        alignment=TA_CENTER,
    )
    styles["section"] = ParagraphStyle(
        "section",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=_ORANGE,
        spaceBefore=14,
        spaceAfter=6,
        borderPad=0,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9,
        textColor=_DARK,
        leading=14,
        alignment=TA_JUSTIFY,
    )
    styles["mono"] = ParagraphStyle(
        "mono",
        fontName="Courier",
        fontSize=8,
        textColor=_DARK,
        leading=12,
        backColor=_LIGHT,
        leftIndent=6,
        rightIndent=6,
        spaceBefore=3,
        spaceAfter=3,
    )
    styles["label"] = ParagraphStyle(
        "label",
        fontName="Helvetica-Bold",
        fontSize=8,
        textColor=_MID,
    )
    styles["finding_title"] = ParagraphStyle(
        "finding_title",
        fontName="Helvetica-Bold",
        fontSize=9,
        textColor=_BLACK,
    )
    styles["small"] = ParagraphStyle(
        "small",
        fontName="Helvetica",
        fontSize=7,
        textColor=_MID,
        leading=10,
    )
    styles["footer"] = ParagraphStyle(
        "footer",
        fontName="Helvetica",
        fontSize=7,
        textColor=_MID,
        alignment=TA_CENTER,
    )
    styles["verdict_ok"] = ParagraphStyle(
        "verdict_ok",
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=colors.HexColor("#059669"),
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    styles["verdict_critical"] = ParagraphStyle(
        "verdict_critical",
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=colors.HexColor("#DC2626"),
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    styles["verdict_high"] = ParagraphStyle(
        "verdict_high",
        fontName="Helvetica-Bold",
        fontSize=14,
        textColor=colors.HexColor("#EA580C"),
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    return styles


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _hr(story, color=_BORDER, thickness=0.5):
    story.append(HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=4, spaceBefore=4))


def _meta_table(data: list[tuple[str, str]], styles) -> Table:
    """Tabela de duas colunas para info do documento."""
    rows = [[Paragraph(k, styles["label"]), Paragraph(v, styles["body"])] for k, v in data]
    t = Table(rows, colWidths=[4 * cm, None], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def _badge_table(label: str, color) -> Table:
    """Badge colorido de severidade."""
    cell = Paragraph(
        f'<font color="white"><b> {label} </b></font>',
        ParagraphStyle("badge", fontName="Helvetica-Bold", fontSize=8, alignment=TA_CENTER),
    )
    t = Table([[cell]], colWidths=[2.2 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), color),
        ("ROUNDEDCORNERS", [2, 2, 2, 2]),
        ("TOPPADDING", (0, 0), (0, 0), 2),
        ("BOTTOMPADDING", (0, 0), (0, 0), 2),
        ("LEFTPADDING", (0, 0), (0, 0), 4),
        ("RIGHTPADDING", (0, 0), (0, 0), 4),
    ]))
    return t


# ─── Seções do Parecer ───────────────────────────────────────────────────────

def _section_header(story, text: str, styles):
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(text, styles["section"]))
    _hr(story, color=_ORANGE, thickness=1)


def _build_header(story, report: ScanReport, styles):
    """Cabeçalho institucional + título."""
    # Topo: marca Lumen
    story.append(Spacer(1, 4 * mm))
    lumen_brand = Paragraph(
        '<font color="#E8440A"><b>LUMEN</b></font>'
        '<font color="#4A4A4A"> · Análise Forense de Documentos Jurídicos</font>',
        ParagraphStyle("brand", fontName="Helvetica-Bold", fontSize=13, alignment=TA_LEFT),
    )
    story.append(lumen_brand)
    story.append(Spacer(1, 1 * mm))
    _hr(story, color=_ORANGE, thickness=2)
    story.append(Spacer(1, 2 * mm))

    story.append(Paragraph("PARECER TÉCNICO-JURÍDICO", styles["title"]))
    story.append(Paragraph("Análise Forense de Prompt Injection em Documento PDF", styles["subtitle"]))
    story.append(Spacer(1, 4 * mm))
    _hr(story)


def _build_doc_info(story, report: ScanReport, styles):
    """Tabela com dados do documento analisado."""
    _section_header(story, "1. IDENTIFICAÇÃO DO DOCUMENTO", styles)

    file_name = Path(report.file_path).name
    size_kb = report.file_size_bytes / 1024

    data = [
        ("Arquivo:", file_name),
        ("Tamanho:", f"{size_kb:.1f} KB · {report.page_count} página(s)"),
        ("SHA-256:", report.sha256),
        ("Analisado em:", report.scanned_at.strftime("%d/%m/%Y às %H:%M:%S %Z")),
        ("Duração da análise:", f"{report.duration_ms} ms"),
        ("Versão do Scanner:", "Lumen Scanner 0.1.0"),
    ]

    story.append(_meta_table(data, styles))

    story.append(Spacer(1, 3 * mm))
    story.append(Paragraph(
        "O hash SHA-256 acima identifica unicamente o arquivo examinado. Qualquer alteração, "
        "mesmo de um único byte, produzirá hash diferente — garantindo a integridade da cadeia de custódia "
        "para fins de eventual juntada aos autos.",
        styles["body"],
    ))


def _build_verdict(story, report: ScanReport, styles):
    """Veredito em destaque."""
    _section_header(story, "2. VEREDITO", styles)

    sev = report.overall_severity
    n = len(report.findings)

    if not report.has_injection:
        verdict_style = styles["verdict_ok"]
        verdict_text = "✓ DOCUMENTO LIMPO"
        summary = (
            "A análise forense não identificou nenhum padrão compatível com técnicas conhecidas de "
            "prompt injection. O documento pode ser submetido a sistemas de inteligência artificial "
            "com baixo risco de manipulação de resposta."
        )
        bg = colors.HexColor("#F0FDF4")
        border_color = colors.HexColor("#059669")
    elif sev == Severity.CRITICAL:
        verdict_style = styles["verdict_critical"]
        verdict_text = f"⚠ MANIPULAÇÃO CONFIRMADA — {n} OCORRÊNCIA(S)"
        summary = (
            f"Foram identificados {n} finding(s) de severidade CRÍTICA. O documento contém "
            "instruções ocultas capazes de manipular respostas de sistemas de IA. "
            "<b>Recomenda-se não submeter este arquivo a qualquer sistema de IA sem prévia higienização.</b>"
        )
        bg = colors.HexColor("#FEF2F2")
        border_color = colors.HexColor("#DC2626")
    else:
        verdict_style = styles["verdict_high"]
        verdict_text = f"⚠ INDÍCIOS DE MANIPULAÇÃO — {n} OCORRÊNCIA(S)"
        summary = (
            f"Foram identificados {n} finding(s) de severidade {_SEV_LABELS[sev]}. "
            "O documento apresenta padrões suspeitos que exigem revisão antes de uso com sistemas de IA."
        )
        bg = colors.HexColor("#FFF7ED")
        border_color = colors.HexColor("#EA580C")

    # Box de veredito
    verdict_box_data = [
        [Paragraph(verdict_text, verdict_style)],
        [Paragraph(summary, ParagraphStyle(
            "v_body", fontName="Helvetica", fontSize=9, textColor=_DARK,
            leading=13, alignment=TA_JUSTIFY,
        ))],
    ]
    vt = Table(verdict_box_data, colWidths=["100%"])
    vt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 1.5, border_color),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(KeepTogether([vt]))


def _build_findings(story, report: ScanReport, styles):
    """Detalhamento de cada finding."""
    if not report.findings:
        return

    _section_header(story, "3. DETALHAMENTO DAS OCORRÊNCIAS", styles)

    for i, f in enumerate(report.findings, start=1):
        sev_color = _SEV_COLORS[f.severity]
        sev_label = _SEV_LABELS[f.severity]
        tech_label = _TECHNIQUE_LABELS[f.technique]

        items: list = []

        # Título da ocorrência + badge
        header_row = [
            [
                Paragraph(f"Ocorrência #{i} — {tech_label}", styles["finding_title"]),
                _badge_table(sev_label, sev_color),
            ]
        ]
        ht = Table(header_row, colWidths=[None, 2.6 * cm], hAlign="LEFT")
        ht.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ]))
        items.append(ht)
        items.append(Spacer(1, 2 * mm))

        # Metadados da ocorrência
        meta = [
            ("Confiança estática:", f"{f.confidence:.0%}"),
            ("Técnica:", f.technique.value),
        ]
        if f.semantic_verdict:
            sem_label = {
                "injection": "INJEÇÃO CONFIRMADA",
                "watermark_legitimo": "Watermark legítimo",
                "falso_positivo": "Falso positivo",
            }.get(f.semantic_verdict, f.semantic_verdict)
            sem_conf = f"{f.semantic_confidence:.0%}" if f.semantic_confidence is not None else ""
            meta.append(("Veredito semântico:", f"{sem_label} ({sem_conf})"))
            if f.semantic_reasoning:
                meta.append(("Análise IA:", f.semantic_reasoning))
        if f.page:
            meta.append(("Página:", str(f.page)))
        if f.bbox:
            meta.append(("Bbox:", f"({f.bbox[0]:.1f}, {f.bbox[1]:.1f}, {f.bbox[2]:.1f}, {f.bbox[3]:.1f})"))
        if f.notes:
            meta.append(("Notas técnicas:", f.notes))

        items.append(_meta_table(meta, styles))
        items.append(Spacer(1, 2 * mm))

        # Texto encontrado
        if f.text_excerpt:
            items.append(Paragraph("Trecho detectado:", styles["label"]))
            items.append(Spacer(1, 1 * mm))
            # Sanitizar para XML do ReportLab
            excerpt_safe = (f.text_excerpt[:400]
                            .replace("&", "&amp;")
                            .replace("<", "&lt;")
                            .replace(">", "&gt;"))
            items.append(Paragraph(excerpt_safe, styles["mono"]))
            items.append(Spacer(1, 2 * mm))

        # Comando reconstruído (se diferente do excerpt)
        if f.reconstructed_command and f.reconstructed_command != f.text_excerpt:
            items.append(Paragraph("Instrução reconstruída:", styles["label"]))
            items.append(Spacer(1, 1 * mm))
            cmd_safe = (f.reconstructed_command[:600]
                        .replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;"))
            items.append(Paragraph(cmd_safe, styles["mono"]))

        # Box da ocorrência
        box_data = [[item] for item in items]
        bt = Table(box_data, colWidths=["100%"])
        bt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), _LIGHT),
            ("BOX", (0, 0), (-1, -1), 1, _BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, 0), 8),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 8),
            ("TOPPADDING", (0, 1), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
        ]))
        story.append(KeepTogether([bt, Spacer(1, 3 * mm)]))


def _build_techniques(story, report: ScanReport, styles):
    """Glossário das técnicas encontradas."""
    if not report.findings:
        return

    _section_header(story, "4. GLOSSÁRIO TÉCNICO", styles)

    story.append(Paragraph(
        "As técnicas identificadas neste documento são descritas abaixo para fins de instrução processual:",
        styles["body"],
    ))
    story.append(Spacer(1, 3 * mm))

    seen = set()
    for f in report.findings:
        if f.technique in seen:
            continue
        seen.add(f.technique)

        story.append(Paragraph(
            f"<b>{_TECHNIQUE_LABELS[f.technique]}</b>",
            styles["body"],
        ))
        story.append(Paragraph(_TECHNIQUE_DESC[f.technique], styles["body"]))
        story.append(Spacer(1, 3 * mm))


def _build_conclusion(story, report: ScanReport, styles):
    """Conclusão técnica com recomendações."""
    _section_header(story, "5. CONCLUSÃO E RECOMENDAÇÕES", styles)

    if not report.has_injection:
        story.append(Paragraph(
            "Com base na análise forense realizada, o documento identificado pelo hash SHA-256 acima "
            "<b>não apresenta evidências</b> de técnicas de prompt injection nas camadas examinadas: "
            "texto de cor invisível, fontes microscópicas, conteúdo fora da área visível, "
            "caracteres de largura zero, metadados e camadas OCG. "
            "O risco de manipulação involuntária de sistemas de IA é considerado baixo.",
            styles["body"],
        ))
    else:
        n = len(report.findings)
        sev = report.overall_severity
        story.append(Paragraph(
            f"A análise forense identificou <b>{n} ocorrência(s)</b> de técnicas de prompt injection "
            f"com severidade máxima <b>{_SEV_LABELS[sev]}</b>. "
            "As instruções ocultas detectadas têm potencial de alterar o comportamento de sistemas "
            "de inteligência artificial que processem este documento, podendo induzir conclusões "
            "incorretas ou favoráveis a uma das partes.",
            styles["body"],
        ))
        story.append(Spacer(1, 3 * mm))
        story.append(Paragraph("<b>Recomendações:</b>", styles["body"]))
        story.append(Spacer(1, 1 * mm))

        recs = [
            "Não submeter o arquivo original a qualquer sistema de IA sem prévia higienização.",
            "Solicitar nova versão do documento ao remetente, preferencialmente via canal seguro com "
            "confirmação de integridade (hash SHA-256 informado separadamente).",
            "Considerar representação junto à OAB caso a autoria da manipulação seja identificável.",
            "Conservar o arquivo original e este parecer como prova para eventual incidente processual.",
            "Em caso de dúvida sobre a integridade de outros documentos da mesma parte, "
            "realizar análise forense individual em cada arquivo.",
        ]
        for rec in recs:
            story.append(Paragraph(f"• {rec}", styles["body"]))
            story.append(Spacer(1, 1 * mm))

    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(
        "Este parecer foi gerado automaticamente pelo Lumen Scanner e destina-se a subsidiar "
        "a avaliação técnica do documento. Não constitui prova pericial em sentido estrito, "
        "mas pode ser utilizado como elemento de convicção e base para solicitação de perícia oficial.",
        ParagraphStyle(
            "disclaimer_body",
            fontName="Helvetica-Oblique",
            fontSize=8,
            textColor=_MID,
            leading=12,
            alignment=TA_JUSTIFY,
        ),
    ))


def _build_footer_section(story, styles):
    """Rodapé com dados do emissor."""
    story.append(Spacer(1, 6 * mm))
    _hr(story, color=_ORANGE, thickness=1)
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph(
        "Lumen Scanner 0.1.0 · GenixJur — HubTech · lumen.law · "
        f"Emitido em {datetime.now().strftime('%d/%m/%Y')}",
        styles["footer"],
    ))
    story.append(Paragraph(
        "Este documento é confidencial e destinado exclusivamente ao destinatário identificado.",
        styles["footer"],
    ))


# ─── Função pública ───────────────────────────────────────────────────────────

def generate_parecer(report: ScanReport, output_path: str | Path | None = None) -> bytes:
    """Gera o Parecer Técnico-Jurídico em PDF.

    Args:
        report: resultado do scan
        output_path: se fornecido, salva em disco; sempre retorna bytes

    Returns:
        Conteúdo do PDF como bytes.
    """
    buffer = io.BytesIO()
    styles = _build_styles()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        title=f"Parecer Lumen — {Path(report.file_path).name}",
        author="Lumen Scanner · HubTech",
        subject="Análise Forense de Prompt Injection",
    )

    story = []
    _build_header(story, report, styles)
    _build_doc_info(story, report, styles)
    _build_verdict(story, report, styles)
    _build_findings(story, report, styles)
    _build_techniques(story, report, styles)
    _build_conclusion(story, report, styles)
    _build_footer_section(story, styles)

    doc.build(story)

    pdf_bytes = buffer.getvalue()

    if output_path is not None:
        Path(output_path).write_bytes(pdf_bytes)

    return pdf_bytes
