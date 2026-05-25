# Lumen

> Detector forense de **prompt injection** em documentos jurídicos.
> Parte da vertical **GenixJur** (HubTech).

## O que é

Dois produtos compartilhando um core:

- **Lumen Scanner** — análise forense estática de PDF/DOCX. Detecta 6 vetores: white text, micro font, off-page, zero-width chars, metadata, OCG layers.
- **Lumen Shield** — proxy de IA jurídica. Blinda Claude/ChatGPT/Gemini em tempo de uso com firewall automático + alertas do Scanner.

## Status

`pré-MVP · validação de mercado`

- [x] Landing + dashboard (mockup HTML)
- [x] Roadmap técnico ([ROADMAP.md](ROADMAP.md))
- [ ] Domínio `lumen.law`
- [ ] Backend Python (FastAPI + PyMuPDF)
- [ ] Frontend Next.js 16 (template Fintrixity)

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.12 + FastAPI + PyMuPDF |
| Frontend | Next.js 16 + Tailwind v4 + shadcn/ui |
| Banco | Supabase Cloud (PostgreSQL + RLS) |
| LLM | Anthropic Claude Haiku 4.5 (prompt caching) |
| Deploy | Fly.io (api, GRU) + Vercel (web) |
| Pagamento | Stripe Brasil (PIX + cartão) |

## Estrutura

Ver [ROADMAP.md §3](ROADMAP.md) — monorepo Poetry workspaces:

```
lumen/
├── apps/{api,web,cli}
├── packages/{core,shield,integrations}
└── infra/{supabase,fly,vercel}
```

## Casos que motivaram este produto

- **STJ · 20.05.2026** — 11 processos com injection detectado, inquérito instaurado
- **TRT-8 Parauapebas** — multa de R$ 84.250 + ofício à OAB
- **TJ-SP 2ª Vara Cível · 21.05.2026** — juiz cobra explicações de advogado
- **TJ-PB 3ª Turma** — advogado confessa uso de "artefato textual"

## Licença

Proprietário · HubTech · Todos os direitos reservados.
