# Lumen — Roadmap Técnico

> **Última atualização:** 2026-05-25
> **Status:** Pré-MVP · validação de mercado
> **Stack:** Python (backend) + Next.js 16 (frontend) + Supabase (auth/db) + Vercel/Fly.io (deploy)
> **Repo proposto:** `github.com/redpro-ai-solutions/lumen` (privado até GA)

---

## 0. Decisões arquiteturais não-negociáveis

| Decisão | Escolha | Por quê |
|---|---|---|
| Linguagem do core | **Python** (FastAPI) | PyMuPDF é referência absoluta em PDF; ecossistema de ML/segurança em Python é maior |
| Frontend | **Next.js 16 + App Router** | Reuso do template Fintrixity (CRM-Jud) |
| Banco | **Supabase Cloud** (PostgreSQL + RLS) | Auth nativo, row-level security, multi-tenant trivial |
| LLM | **Anthropic Claude Haiku 4.5** para camada semântica | Custo baixo (~$0.001/análise), latência <1s |
| Storage | **Supabase Storage** com criptografia em repouso + delete-after-analyze por padrão | LGPD + DPO designado |
| Hosting backend | **Fly.io** (Brasil — GRU) | Latência baixa + escala horizontal + servidores no BR |
| Hosting frontend | **Vercel** (edge BR) | DX + preview deploys |
| Pagamentos | **Stripe Brasil** (PIX + cartão) | Único provider com checkout PIX + recorrência |
| Observabilidade | **Sentry** + **Axiom** | Erros + logs estruturados |

---

## 1. Os dois produtos dentro do Lumen

```
┌─────────────────────┐      ┌─────────────────────┐
│   LUMEN SCANNER     │      │   LUMEN SHIELD      │
│   (análise estática)│      │   (proxy em runtime)│
├─────────────────────┤      ├─────────────────────┤
│ Input: PDF/DOCX     │      │ Input: prompt + doc │
│ Output: relatório   │      │ Output: resposta IA │
│ Use: pré-revisão    │      │ Use: durante uso    │
│ MVP no Q2.2026      │      │ Beta no Q3.2026     │
└─────────────────────┘      └─────────────────────┘
         │                            │
         └──────── compartilham ──────┘
              core de detecção
              (lumen-core lib)
```

**Princípio:** **um único core de detecção** servindo dois produtos com superfícies diferentes.

---

## 2. Roadmap por fase

### 🔴 **FASE 0 — Validação de mercado** (semanas 1-2 · jun/2026)

Sem código. Apenas:

- [ ] Landing publicada em `lumen.law` (já temos HTML — só hospedar na Vercel)
- [ ] Captura de waitlist com Stripe checkout pré-autorizado (R$ 1 pra validar intenção real)
- [ ] DM pra @iannacabanelas propondo parceria afiliada
- [ ] Postagem orgânica @redpro.ia: carrossel "3 métodos manuais vs Lumen automatizado"
- [ ] Reach-out a 20 advogados conhecidos pra entrevista de 15min

**Critério de avanço:** ≥30 waitlist + ≥5 entrevistas confirmando dor real.

---

### 🟠 **FASE 1 — Scanner MVP** (semanas 3-6 · jun-jul/2026)

**Objetivo:** primeiro pagamento de R$ 79.

#### Backend (`lumen-core` + `lumen-api`)

- [x] Estrutura do pacote Python com setuptools: `apps/scanner-cli/` (CLI instalável) — *25/05/2026*
- [x] **Detector 1 — White text:** PyMuPDF span analysis. Flag `color RGB > 0.9` em fundo similar. — *25/05/2026*
- [x] **Detector 2 — Micro font:** flag `size < 2pt`. — *25/05/2026*
- [x] **Detector 3 — Off-page:** expand cropbox → mediabox, detecta texto fora do visível. — *25/05/2026*
- [x] **Detector 4 — ZWC:** regex Unicode sobre texto + anotações + metadados. — *25/05/2026*
- [x] **Detector 5 — Metadata:** parse `/Title`, `/Subject`, `/Keywords`, `/Author`, `/Producer`, `/Creator`. — *25/05/2026*
- [x] **Detector 6 — OCG:** parsing estrutural de Optional Content Groups. — *25/05/2026*
- [x] CLI `lumen <pdf>` com Rich UI + `--json` + `--quiet` + `--parecer`. — *25/05/2026*
- [x] Geração de Parecer Técnico-Jurídico PDF (ReportLab) com SHA-256, veredito, findings, glossário, recomendações. — *25/05/2026*
- [x] 7 PDFs de teste sintéticos (01_clean → 07_combined) para validação red team. — *25/05/2026*
- [x] **Semantic layer:** Claude Haiku classifica `injection | watermark_legitimo | falso_positivo` com prompt caching. Flag `--semantic` na CLI + `?semantic=true` na API. — *25/05/2026*
- [x] Suite de testes pytest: 52 testes cobrindo detectores + scanner + parecer + API. — *25/05/2026*
- [x] GitHub Actions CI: matrix Python 3.11/3.12 + ruff lint. — *25/05/2026*
- [ ] **Diff visual:** render PDF como PNG (PyMuPDF) → Tesseract OCR → diff com `pdftotext`. Discrepâncias = conteúdo oculto. *(requer Tesseract instalado no servidor)*
- [x] Endpoint `POST /analyze` (FastAPI) recebe PDF, retorna JSON com `findings[]`, `severity`, `confidence`, `reconstructed_commands[]`. — *25/05/2026*
- [x] Endpoint `POST /analyze/parecer` retorna PDF do Parecer direto para download. — *25/05/2026*
- [x] Dockerfile + fly.toml (Fly.io GRU) para deploy do backend. — *25/05/2026*

#### Frontend (`lumen-app`)

- [x] Migrar mockup HTML para Next.js + App Router no template Fintrixity (Space Grotesk + JetBrains Mono + deisgn system Fintrixity). — *26/05/2026*
- [x] Drag-and-drop upload com progress bar em 4 etapas (enviando/analisando/salvando/concluído). — *26/05/2026*
- [x] Dashboard de análises com stats (total/injection/limpos) + lista com badge de severidade. — *26/05/2026*
- [x] Tela de detalhamento forense com findings completos, veredito semântico IA, SHA-256, bbox. — *26/05/2026*
- [ ] Download do Parecer PDF diretamente da tela de detalhe (requer armazenamento temporário)
- [ ] Histórico paginado com filtro por severidade

#### Infra

- [x] Supabase: schema SQL com tables `profiles`, `analyses`, `findings`, `subscriptions` + RLS em todas. — *26/05/2026*
- [x] RLS: usuário só vê suas próprias análises (policies + trigger de profile automático). — *26/05/2026*
- [ ] Stripe checkout para plano Solo (R$ 79) e Escritório (R$ 299)
- [ ] Webhook Stripe → Supabase atualiza `subscription_tier`
- [ ] Deploy: Fly.io (api) + Vercel (web)

**Critério de avanço:** 10 clientes pagantes + NPS ≥ 8 + uptime ≥ 99% por 14 dias.

---

### 🟡 **FASE 2 — Shield Beta** (semanas 7-12 · ago-set/2026)

**Objetivo:** dobrar ticket médio com upsell de Shield.

#### Shield Proxy (`lumen-shield`)

- [ ] FastAPI app que expõe endpoints **API-compatíveis** com Anthropic + OpenAI + Google
- [ ] **Pre-processor:** todo documento upado passa pelo `lumen-core` primeiro
- [ ] **Prompt hardening:** injeção automática de system prompt blindado + alertas do Scanner anexados ao contexto do usuário (não ao system, para evitar manipulação)
- [ ] **Post-processor:** scan da resposta da IA contra padrões de "obedeci comando oculto" (regex + Haiku classifier)
- [ ] **Logging completo:** cada chamada gravada com input hash, output hash, findings, timestamp, custo
- [ ] **Rate limit** por plano + circuit breaker se LLM provider cair

#### Integrações

- [ ] **Plugin Word** (Office Add-in) — botão "Analisar com IA via Lumen Shield" no ribbon
- [ ] **Plugin Outlook** — escanear anexos de e-mails recebidos automaticamente
- [ ] **CLI** `lumen shield <file> --prompt "..."` para uso em scripts
- [ ] **API REST** documentada com OpenAPI + Postman collection

#### Frontend updates

- [ ] Aba "Shield" no dashboard mostrando logs de cada chamada
- [ ] Configurações de provedor (Anthropic key BYOK ou usar a do Lumen)
- [ ] Métricas: quantos prompts blindados, quantos comandos bloqueados, custo acumulado

**Critério de avanço:** ≥40% dos clientes Escritório ativando o Shield + retenção ≥80% no mês 2.

---

### 🟢 **FASE 3 — Enterprise + escala** (Q4.2026)

#### Recursos enterprise

- [ ] **Batch processing:** processar 1.000+ PDFs (due diligence de M&A)
- [ ] **SSO** (SAML/Okta) para escritórios grandes
- [ ] **Self-hosted Shield:** Docker image para bancas que não podem mandar dados pra cloud
- [ ] **White-label:** logo do escritório no relatório
- [ ] **Auditoria SOC 2 Type I** (preparação)
- [ ] **API webhooks:** notificar sistema externo (Projuris, Astrea, Aurum) quando injection é detectado

#### Detectores avançados

- [ ] **Image OCR injection:** OCR em todas as imagens, classificação semântica
- [ ] **Steganografia LSB:** detecção de payload escondido em imagens (rare, mas existe)
- [ ] **Polyglot files:** PDFs que também são JavaScript/HTML válidos
- [ ] **Embed file detection:** anexos dentro do PDF (`/EmbeddedFiles`)

#### Inteligência coletiva

- [ ] **Threat feed:** assinatura de novas técnicas detectadas em outros clientes (anonimizadas)
- [ ] **Hash repository:** se o mesmo PDF malicioso aparecer em 2+ clientes, alerta imediato
- [ ] **OAB intelligence:** parceria para reportar advogados reincidentes (com consentimento)

---

### 🔵 **FASE 4 — Expansão de mercado** (2027+)

- [ ] **Lumen Health:** mesmo motor para laudos médicos (sinergia com GenixMed)
- [ ] **Lumen Finance:** análise de relatórios financeiros e contratos bancários
- [ ] **Lumen HR:** detecção de injection em currículos (ManpowerGroup achou em 10% dos CVs)
- [ ] **Lumen Gov:** licitações e processos administrativos
- [ ] **Internacional:** Portugal e Espanha (mesmo idioma jurídico, advocacia digitalizada)

---

## 3. Estrutura de pastas — repo `lumen`

```
lumen/
├── apps/
│   ├── api/              # FastAPI — endpoints Scanner + Shield
│   ├── web/              # Next.js 16 — dashboard + landing
│   └── cli/              # Python CLI standalone
│
├── packages/
│   ├── core/             # lumen-core — detectores compartilhados
│   │   ├── detectors/
│   │   │   ├── white_text.py
│   │   │   ├── micro_font.py
│   │   │   ├── off_page.py
│   │   │   ├── zwc.py
│   │   │   ├── metadata.py
│   │   │   └── ocg.py
│   │   ├── semantic.py   # Claude Haiku classifier
│   │   ├── pipeline.py   # orquestrador das 4 camadas
│   │   └── report.py     # geração do parecer PDF
│   │
│   ├── shield/           # proxy de IA (Fase 2)
│   │   ├── providers/
│   │   │   ├── anthropic.py
│   │   │   ├── openai.py
│   │   │   └── google.py
│   │   ├── hardening.py  # injeção de firewall
│   │   └── audit.py
│   │
│   └── integrations/
│       ├── word/         # Office Add-in
│       ├── outlook/
│       └── projuris/
│
├── infra/
│   ├── supabase/         # migrations + seeds
│   ├── fly/              # fly.toml + Dockerfile
│   └── vercel/           # vercel.json
│
├── docs/                 # docs internos (arquitetura, decisões)
├── tests/                # pytest + playwright
├── .github/workflows/    # CI/CD
├── pyproject.toml        # Poetry workspaces
└── README.md
```

---

## 4. Decisões de produto (não esqueçer)

### Posicionamento

- **NÃO** somos detector genérico de prompt injection. Somos **especialistas em jurídico BR**.
- Linguagem do produto: técnica-jurídica, não techbro. "Parecer" > "relatório", "juntada" > "export".
- Visual Fintrixity dark+laranja = autoridade tech, não consumer.

### Anti-features (o que NÃO faremos)

- ❌ Reescrita do documento (responsabilidade do advogado, não nossa)
- ❌ Análise jurídica do mérito (escopo do Genix.Jur, não do Lumen)
- ❌ Assinatura digital do documento (ICP-Brasil, etc — comoditizado)
- ❌ OCR de PDFs escaneados sem texto (escopo de outro produto)

### Métricas de sucesso

| Fase | Métrica primária | Meta |
|---|---|---|
| Fase 0 | Waitlist | ≥ 30 |
| Fase 1 | MRR | R$ 4.000 (50 contas Solo) |
| Fase 2 | MRR | R$ 15.000 (mix Solo+Escritório, ≥40% com Shield) |
| Fase 3 | MRR | R$ 50.000 (≥3 contas Enterprise) |
| Fase 4 | ARR | R$ 1.2M |

---

## 5. Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| CNJ lançar ferramenta gratuita pública | Média | Foco em extrajudicial (CNJ só cuida do Judiciário) |
| LLM provider banir nosso uso (resposta com "ataque") | Baixa | Múltiplos providers + fallback local com Llama Guard |
| Falso positivo gera fricção com advogado | Alta | Confidence score visível + revisão humana antes de "acusar" |
| Concorrente americano entra no BR | Média | Velocidade + idioma + LGPD + parceria OAB |
| Injection evolui mais rápido que nossos detectores | Média | Camada semântica + threat feed coletivo |

---

## 6. Próxima ação concreta

**Esta semana (semana de 25/05/2026):**

1. Decidir nome final (Lumen vs alternativa) — eu sugiro manter Lumen
2. Registrar domínio `lumen.law` (ou variação)
3. Criar org `redpro-ai-solutions` no GitHub (se já não existir)
4. Criar repo privado `lumen`
5. Subir os 2 HTMLs atuais + este ROADMAP como primeiro commit
6. DM pra Ianna Cabanelas

**Quem faz o quê:**
- Red: domínio, GitHub org, DM Ianna
- Atlas: subir HTMLs + roadmap + landing na Vercel
- Hades: revisar este roadmap em 7 dias com aprendizados das entrevistas
