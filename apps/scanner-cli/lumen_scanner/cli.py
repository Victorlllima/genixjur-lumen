"""CLI principal — `lumen <arquivo.pdf>`."""

import json
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from .models import Severity
from .parecer import generate_parecer
from .scanner import scan

console = Console()

SEVERITY_COLORS = {
    Severity.CRITICAL: "bold red",
    Severity.HIGH: "red",
    Severity.MEDIUM: "yellow",
    Severity.LOW: "blue",
    Severity.INFO: "green",
}


def _print_report_pretty(report) -> None:
    console.print()
    console.rule(f"[bold #E8440A]LUMEN SCANNER[/] · Análise forense de prompt injection")
    console.print()

    # Cabeçalho
    info = Table.grid(padding=(0, 2))
    info.add_column(style="dim")
    info.add_column()
    info.add_row("Arquivo:", str(report.file_path))
    info.add_row("SHA-256:", report.sha256)
    info.add_row("Tamanho:", f"{report.file_size_bytes:,} bytes · {report.page_count} páginas")
    info.add_row("Analisado em:", report.scanned_at.strftime("%Y-%m-%d %H:%M:%S %Z"))
    info.add_row("Duração:", f"{report.duration_ms}ms")
    console.print(Panel(info, title="Documento", border_style="dim"))

    # Veredito
    color = SEVERITY_COLORS[report.overall_severity]
    veredito = Text()
    if report.has_injection:
        veredito.append("⚠  INJECTION DETECTADO\n", style=color)
        veredito.append(f"\nSeveridade geral: {report.overall_severity.value}", style=color)
        veredito.append(f"\n{len(report.findings)} finding(s)")
    else:
        veredito.append("✓ DOCUMENTO LIMPO\n", style="bold green")
        veredito.append("\nNenhum padrão de prompt injection detectado.")
    console.print(Panel(veredito, title="Veredito", border_style=color if report.has_injection else "green"))

    if not report.findings:
        console.print()
        return

    # Detalhamento por finding
    for i, f in enumerate(report.findings, start=1):
        c = SEVERITY_COLORS[f.severity]
        detail = Table.grid(padding=(0, 2))
        detail.add_column(style="dim", min_width=20)
        detail.add_column()
        detail.add_row("Técnica:", f.technique.value)
        detail.add_row("Severidade:", Text(f.severity.value, style=c))
        detail.add_row("Confiança:", f"{f.confidence:.0%}")
        if f.page:
            detail.add_row("Página:", str(f.page))
        if f.bbox:
            detail.add_row("Bbox:", f"({f.bbox[0]:.1f}, {f.bbox[1]:.1f}, {f.bbox[2]:.1f}, {f.bbox[3]:.1f})")
        detail.add_row("Texto:", Text(f.text_excerpt[:200], style="italic"))
        detail.add_row("Reconstruído:", Text(f.reconstructed_command[:400], style="bold yellow"))
        if f.notes:
            detail.add_row("Notas:", Text(f.notes, style="dim"))
        console.print(Panel(detail, title=f"Finding #{i}", border_style=c))


@click.command()
@click.argument("file_path", type=click.Path(exists=True, dir_okay=False))
@click.option("--json", "as_json", is_flag=True, help="Output em JSON (para integração)")
@click.option("--quiet", is_flag=True, help="Apenas exit code (0=limpo, 1=injection)")
@click.option("--parecer", "parecer_path", default=None, metavar="SAIDA.pdf",
              help="Gera Parecer Técnico-Jurídico em PDF no caminho indicado")
@click.option("--semantic", is_flag=True,
              help="Enriquece findings com classificação via Claude Haiku (requer ANTHROPIC_API_KEY)")
def main(file_path: str, as_json: bool, quiet: bool, parecer_path: str | None, semantic: bool) -> None:
    """Lumen Scanner — analisa um PDF em busca de prompt injection.

    Exemplos:
        lumen contrato.pdf
        lumen contrato.pdf --json
        lumen contrato.pdf --parecer parecer.pdf
        lumen contrato.pdf --semantic --json
        lumen contrato.pdf --quiet && echo "limpo"
    """
    report = scan(file_path, semantic=semantic)

    if as_json:
        print(json.dumps(report.to_dict(), indent=2, ensure_ascii=False))
    elif not quiet:
        _print_report_pretty(report)

    if parecer_path:
        generate_parecer(report, output_path=parecer_path)
        if not quiet:
            console.print(f"\n[bold green]✓ Parecer gerado:[/] {parecer_path}")

    sys.exit(1 if report.has_injection else 0)


if __name__ == "__main__":
    main()
