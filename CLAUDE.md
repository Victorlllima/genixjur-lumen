# Lumen — Instruções do Projeto

## Visão Geral

**Lumen** é um produto da vertical **GenixJur** (HubTech) que detecta prompt injection em documentos jurídicos. Dois produtos compartilhando um core:

- **Lumen Scanner** — análise forense estática de PDF/DOCX (6 vetores de ataque)
- **Lumen Shield** — proxy de IA jurídica com firewall automático em runtime

## Status atual

Pré-MVP · Fase 0 (Validação) · Estratégia: **Concierge MVP** (vender antes de buildar)

**Sempre que entrar neste projeto, leia primeiro `CURRENT_STATUS.md`.** Ele tem o estado vivo.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.12 + FastAPI + PyMuPDF |
| Frontend | Next.js 16 + Tailwind v4 + shadcn/ui (template Fintrixity) |
| Banco | Supabase Cloud (PostgreSQL + RLS) |
| LLM | Anthropic Claude Haiku 4.5 (com prompt caching) |
| Deploy | Fly.io (api, GRU) + Vercel (web) |
| Pagamento | Stripe Brasil (PIX + cartão) |
| Email | Resend (transacional) + Formspree (waitlist) |

## Identidade visual

**Paleta Fintrixity** (dark futuristic):
- bg `#0D0D0D` / cards `#1A1A1A` / border `#2A2A2A`
- accent `#E8440A` (laranja) / accentSoft `#FF6B35`
- text `#FFFFFF` / sub `#8A8A8A`

**Tipografia:** Space Grotesk (display) + Fraunces italic (acentos editoriais) + JetBrains Mono (técnico/valores).

**Detalhes anti-AI-slop:** god rays laranja, grid perspectiva 48px, contraste de peso 100/200 vs 800, layouts assimétricos.

## Arquivos críticos

| Arquivo | Função |
|---|---|
| `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\CURRENT_STATUS.md` | **LER PRIMEIRO.** Estado vivo do projeto. |
| `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\ROADMAP.md` | Plano técnico de 5 fases (Validação → MVP → Beta → Enterprise → Expansão) |
| `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\GO_LIVE.md` | Checklist de 1h30 para entrar no ar (Concierge MVP) |
| `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\index.html` | Landing pública |
| `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\app.html` | Dashboard mockup do produto |
| `c:\Users\RedPro\Desktop\Projetos\Vibecoding\Lumen\README.md` | Descrição público-amigável |

## Convenções deste projeto

- **Posicionamento:** especialista em jurídico BR, não detector genérico. Linguagem técnico-jurídica (parecer > relatório, juntada > export).
- **Não fazer:** reescrita do documento (responsabilidade do advogado), análise de mérito (escopo do Genix.Jur), assinatura digital ICP-Brasil (comoditizado), OCR de PDFs escaneados sem texto.
- **Repo:** `github.com/Victorlllima/genixjur-lumen` (privado, vai migrar para `hubtech/genixjur-lumen` quando a org for criada)
- **Vault:** sem vault ainda — produto pré-MVP. Quando subir backend, criar `~/.shark/vaults/lumen/` e `.vault-context`.

## Agentes S.H.A.R.K.

| Fase | Agente |
|---|---|
| Decisões de produto / arquitetura | Shiva |
| Erros / Diagnóstico | Hades |
| Implementação / Commits | Atlas |
| Testes / QA | Ravena |
| Auditoria pré-deploy | Kerberos |

<!-- HANDOFF_PROTOCOL_v1 -->

---

# PROTOCOLO HANDOFF — OBRIGATÓRIO PARA TODOS OS AGENTES

> Este projeto usa a skill global `handoff` (Método S.H.A.R.K.) para manter o estado vivo.
> Qualquer Claude Code que entrar neste projeto DEVE seguir este protocolo.

## Arquivos vivos do projeto

- `ROADMAP.md` — plano completo, fases, todas as tasks com checkboxes
- `CURRENT_STATUS.md` — snapshot vivo: última task, próxima, blockers, contexto

## Comportamento OBRIGATÓRIO

### 1. Ao iniciar qualquer sessão neste projeto

**Antes da primeira resposta**, o agente DEVE:
1. Ler `CURRENT_STATUS.md`
2. Ler `ROADMAP.md` (pelo menos as seções "Fase atual" e "Próxima task")
3. Cumprimentar Red mencionando explicitamente: fase atual + última task + próxima task

Exemplo de saudação correta:
> "[ATLAS]: Red, estamos no projeto Lumen, Fase 1 (Scanner MVP). Última task: 'Configurar Supabase RLS'. Próxima: 'Implementar detector de white text com PyMuPDF'. Sigo pela próxima ou tem outra prioridade?"

### 2. Ao concluir qualquer task significativa

**Imediatamente após a task ser concluída**, o agente DEVE invocar a skill `/handoff update` (ou aplicar o protocolo equivalente manualmente):

1. Marcar a task como `[x]` em `ROADMAP.md`
2. Atualizar `CURRENT_STATUS.md`:
   - Mover "Última task" pro histórico
   - Preencher nova "Última task" com descrição + timestamp BRT + arquivos modificados
   - Recalcular "Próxima task" lendo o roadmap
3. **Não commitar.** Red decide quando commita.

**O que conta como task significativa:**
- Implementação de feature
- Refactor
- Fix de bug
- Configuração de infra
- Decisão arquitetural
- Mudança que afete arquivos persistidos

**O que NÃO conta:**
- Buscas, leituras, perguntas sem mudança
- Iteração curta de debug que não chegou a uma solução final

### 3. Ao detectar bloqueio

Se aparecer um bloqueio (dependência travada, decisão pendente do Red, erro irrecuperável):
1. Registrar em `CURRENT_STATUS.md` na seção "Bloqueios ativos"
2. Continuar o que dá pra continuar em paralelo, se possível
3. Alertar Red explicitamente

### 4. Datas e paths

- Sempre usar **datas absolutas** com timezone: `2026-05-25 16:30 BRT`
- Sempre referenciar arquivos com **path absoluto**: `c:\Users\RedPro\Desktop\Projetos\Vibecoding\<projeto>\<arquivo>`

### 5. Para devs humanos lendo este protocolo

Você tem 3 caminhos pra saber onde paramos:
1. **Rápido:** ler `CURRENT_STATUS.md` (60 segundos)
2. **Completo:** ler `ROADMAP.md` (5 minutos)
3. **Via Claude:** abrir Claude Code aqui e perguntar "onde paramos?" — ele lê os 2 arquivos e responde

<!-- /HANDOFF_PROTOCOL_v1 -->
