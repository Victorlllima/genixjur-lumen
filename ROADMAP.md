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

- [ ] Estrutura monorepo Python com Poetry: `lumen-core/` (lib) + `lumen-api/` (FastAPI)
- [ ] **Detector 1 — White text:** PyMuPDF span analysis. Flag `color RGB > 0.9` em fundo similar.
- [ ] **Detector 2 — Micro font:** flag `size < 2pt`.
- [ ] **Detector 3 — Off-page:** comparar `bbox` vs `mediabox` da página.
- [ ] **Detector 4 — ZWC:** regex Unicode `[​-‏﻿⁠]`.
- [ ] **Detector 5 — Metadata:** parse `/Title`, `/Subject`, `/Keywords`, `/Author`.
- [ ] **Detector 6 — OCG:** parsing estrutural de Optional Content Groups.
- [ ] **Semantic layer:** texto suspeito → Claude Haiku → classifica `injection | watermark legítimo | falso positivo`. **Com prompt caching** (system prompt grande fica em cache).
- [ ] **Diff visual:** render PDF como PNG (PyMuPDF) → Tesseract OCR → diff com `pdftotext`. Discrepâncias = conteúdo oculto.
- [ ] Endpoint `POST /analyze` recebe PDF, retorna JSON com `findings[]`, `severity`, `confidence`, `reconstructed_commands[]`.
- [ ] Geração de relatório PDF (ReportLab) com SHA-256 do original + assinatura digital interna.

#### Frontend (`lumen-app`)

- [ ] Migrar mockup HTML para Next.js no template Fintrixity
- [ ] Drag-and-drop upload com progress bar
- [ ] Dashboard de análises (já mockado)
- [ ] Tela de detalhamento forense (já mockada)
- [ ] Geração e download do parecer técnico-jurídico
- [ ] Histórico paginado com filtro por severidade

#### Infra

- [ ] Supabase: tables `users`, `analyses`, `findings`, `subscriptions`
- [ ] RLS: usuário só vê suas próprias análises
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
