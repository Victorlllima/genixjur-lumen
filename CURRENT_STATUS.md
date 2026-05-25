# Lumen — Status Atual

> **🤖 Este arquivo é mantido vivo pela skill `/handoff`.**
> **Última atualização automática:** 2026-05-25 16:00 BRT
> **Por quem:** Atlas (Claude Code)

---

## 📍 Onde estamos

**Fase atual:** 🔴 Fase 0 — Validação de mercado
**Progresso global:** 6 / ~40 tasks (~15%)

---

## ✅ Última task concluída

**O que:** Preparar landing para go-live com Concierge MVP
**Quando:** 2026-05-25 15:55 BRT
**Por:** Atlas (Claude Code)
**Arquivos modificados:**
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\index.html` (CTAs apontam para STRIPE_LINK_*, seção waitlist com Formspree, banner Early Adopter)
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\app.html` (renomeado de "Lumen - app.html")
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\vercel.json` (security headers + cleanUrls)
- `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\GO_LIVE.md` (checklist completo de 1h30 para entrar no ar)

**Notas:**
Estratégia escolhida: **Concierge MVP**. Vender Early Adopter Vitalício antes de construir backend.
Cliente paga R$ 79, recebe atendimento manual em até 6h enquanto o app fica pronto (jul/2026).
Validação real de demanda + financia o desenvolvimento (R$ 2.370 MRR com 30 clientes).

---

## ⏭️ Próxima task

**Descrição:** Comprar domínio (`lumen.law` ou `lumen.com.br`) + criar conta Stripe + 2 Payment Links
**Fase:** Fase 0 — Validação de mercado
**Estimativa:** 45min (tarefa do Red, não do Claude)
**Pré-requisitos:**
- Decisão de Red sobre qual domínio comprar (premium .law vs .com.br)
- Cartão de crédito para Stripe BR

**Após Red completar:**
- Red passa Stripe Solo URL + Stripe Escritório URL + Formspree ID
- Atlas roda `sed` substituindo placeholders + commit + push
- Vercel redeploya automaticamente
- Landing fica viva em `lumen.law`

---

## ⚠️ Bloqueios ativos

**Bloqueio 1:** Org GitHub `hubtech` ainda não existe — repo está temporariamente em `Victorlllima/genixjur-lumen` (conta pessoal de Red). Resolve com `gh repo transfer Victorlllima/genixjur-lumen hubtech` após Red criar a org via web UI.

**Bloqueio 2:** Decisão de Red pendente — Felice entra como case real (foto + citação) ou usamos placeholder genérico na landing?

**Bloqueio 3:** DM para @iannacabanelas — esperando Red mandar (template já está em GO_LIVE.md §3.1).

---

## 📜 Histórico recente (últimas 5 tasks)

| Data | Task | Autor |
|---|---|---|
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
