# Lumen — Status Atual

> **🤖 Este arquivo é mantido vivo pela skill `/handoff`.**
> **Última atualização automática:** 2026-05-25 17:10 BRT
> **Por quem:** Atlas (Claude Code)

---

## 📍 Onde estamos

**Fase atual:** 🟠 Fase 1 — Scanner MVP (em andamento)
**Progresso global:** 27 / ~40 tasks (~68%)

---

## ✅ Última task concluída

**O que:** Pré-requisitos para Google App Verification — privacy/terms/logo/favicon + deploy Vercel
**Quando:** 2026-05-26 11:50 BRT
**Por:** Atlas (Claude Code)
**Arquivos criados:**
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\app\layout.tsx`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\app\globals.css` (Fintrixity tokens)
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\app\login\page.tsx`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\app\dashboard\page.tsx`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\app\analyze\page.tsx`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\app\analysis\[id]\page.tsx`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\components\layout\Sidebar.tsx`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\lib\supabase\{client,server,middleware}.ts`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\lib\types\database.ts`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\src\middleware.ts`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\.env.local` (Supabase keys do vault)
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\apps\web\vercel.json`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\infra\supabase\migrations\001_initial_schema.sql`
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\.vault-context` (aponta para vault lumen)
- Credenciais Supabase salvas no vault `lumen`

**Notas:**
Build Next.js 100% limpo (zero TS errors). Rotas: / → /login, /dashboard, /analyze, /analysis/[id].
Auth Supabase SSR com middleware protetor. Design Fintrixity: Space Grotesk + JetBrains Mono + #E8440A.

---

## ⏭️ Próxima task

**Descrição:** Aplicar migration do banco + deploy do frontend na Vercel
**Fase:** Fase 1 — Scanner MVP
**Quem faz:** Red (5-10 min cada)

**Passo 1 — Migration Supabase:** ✅ FEITO em 2026-05-26 12:36 BRT (via Management API + PAT)
- Tabelas criadas: `profiles`, `analyses`, `findings`, `subscriptions` (com RLS habilitado)

**Passo 1.7 — Domínio próprio:** ✅ FEITO em 2026-05-26 13:48 BRT
- CNAME `lumen.redpro.com.br` → `cname.vercel-dns.com.` via Hostinger API
- Vercel domain adicionado e verified=True
- Site URL no Supabase atualizado pra `https://lumen.redpro.com.br`
- HTTPS funcionando (SSL emitido pela Vercel)

**Passo 1.5 — Google OAuth + URL config:** ✅ FEITO em 2026-05-26 12:38 BRT
- `external_google_enabled: true` no Supabase
- Client ID + Secret aplicados (vault: `lumen/google_oauth_*`)
- Site URL e Redirect URLs configurados via API
- Teste end-to-end: `/auth/v1/authorize?provider=google` retorna 302 para `accounts.google.com` corretamente

**Passo 2 — Deploy Vercel:** ✅ FEITO em 2026-05-26 12:04 BRT
- URL: https://lumen-kidbeevv9-redpros-projects.vercel.app
- Projeto: `redpros-projects/lumen`
- Env vars configuradas (Supabase URL/anon + LUMEN_API_URL placeholder)
- Após Red aplicar a migration, refresh da página /login já deve funcionar end-to-end

**Próxima task de Atlas (não depende dos passos acima):**
- Stripe webhook handler (Next.js API route) para atualizar subscription_tier após pagamento

---

## ⚠️ Bloqueios ativos

**Bloqueio 1:** Org GitHub `hubtech` ainda não existe — repo está temporariamente em `Victorlllima/genixjur-lumen` (conta pessoal de Red). Resolve com `gh repo transfer Victorlllima/genixjur-lumen hubtech` após Red criar a org via web UI.

**Bloqueio 2:** Decisão de Red pendente — Felice entra como case real (foto + citação) ou usamos placeholder genérico na landing?

**Bloqueio 3:** DM para @iannacabanelas — esperando Red mandar (template já está em GO_LIVE.md §3.1).

---

## 📜 Histórico recente (últimas 5 tasks)

| Data | Task | Autor |
|---|---|---|
| 2026-05-26 11:50 BRT | Frontend Next.js 15 (login+dashboard+analyze+detail) + schema Supabase + vault lumen | Atlas |
| 2026-05-25 18:00 BRT | Semantic Layer (Haiku+caching) + 52 testes pytest + GitHub Actions CI | Atlas |
| 2026-05-25 17:30 BRT | FastAPI wrapper (`/analyze` JSON + `/analyze/parecer` PDF) + Dockerfile + fly.toml | Atlas |
| 2026-05-25 17:10 BRT | Template de Parecer Técnico-Jurídico PDF + flag `--parecer` na CLI | Atlas |
| 2026-05-25 16:30 BRT | Scanner POC 100% funcional — 6 detectores validados em 7 PDFs sintéticos | Atlas |
| 2026-05-25 15:55 BRT | Preparar landing para go-live (Concierge MVP) | Atlas |
| 2026-05-25 15:30 BRT | Criar repo `genixjur-lumen` no GitHub + primeiro commit | Atlas |
| 2026-05-25 15:00 BRT | Adicionar seção Lumen Shield na landing + atualizar 3 planos | Atlas |
| 2026-05-25 14:40 BRT | Transcrever e analisar reel da Ianna Cabanelas vs Lumen | Atlas |
| 2026-05-25 13:00 BRT | Criar ROADMAP.md técnico em 5 fases | Shiva |
| 2026-05-25 12:45 BRT | Criar landing + dashboard mockup HTML (Fintrixity) | Atlas |

---

## 🧠 Contexto importante pra quem está pegando o projeto

Coisas que não estão no código mas você precisa saber:

- **Posicionamento:** Lumen NÃO é detector genérico de prompt injection. É especialista em jurídico BR. Linguagem do produto é técnico-jurídica (parecer > relatório, juntada > export).
- **Felice** é advogado parceiro/beta tester, validou a dor original do mercado. Pode virar case ou advisor.
- **@iannacabanelas** (113k plays no reel) valida o mercado de graça. Estratégia de DM já no `GO_LIVE.md`.
- **Vertical GenixJur (HubTech):** Lumen é um produto desta vertical, junto com CRM-Jud (template adaptável). HubTech é a empresa de produtos próprios; RedPro AI Solutions é a agência de serviços — coisas distintas.
- **STJ + Multa de R$ 84k (Parauapebas):** manchetes de 20-21/05/2026 são a prova social máxima — usar em todo material de marketing.
- **Stack decidida:** Python (FastAPI + PyMuPDF) backend, Next.js 16 frontend, Supabase, Fly.io, Vercel, Stripe BR, Claude Haiku 4.5 com prompt caching.
- **Estratégia comercial:** Concierge MVP — vender antes de buildar. Primeiros 30 × R$ 79 = R$ 2.370 MRR financiam o backend.
- **Arquivos críticos no projeto:**
  - `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\index.html` — landing
  - `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\app.html` — dashboard mockup
  - `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\ROADMAP.md` — plano técnico 5 fases
  - `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\GO_LIVE.md` — checklist go-live

---

## 🔗 Links úteis

- **Repo:** https://github.com/Victorlllima/genixjur-lumen (privado, vai migrar para `hubtech/`)
- **Deploy:** _pendente — aguardando Vercel deploy_
- **Domínio:** _pendente — Red registra esta semana_
- **Roadmap completo:** [./ROADMAP.md](./ROADMAP.md)
- **Checklist go-live:** [./GO_LIVE.md](./GO_LIVE.md)
- **Fontes motivadoras:** STJ 20/05/2026, Migalhas (Parauapebas), Conjur (TJ-SP), Diário de Justiça (TJ-PB)
