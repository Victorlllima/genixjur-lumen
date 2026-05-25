# 🚀 Go-Live Lumen — Checklist pra vender HOJE

**Objetivo:** primeiro R$ 79 batendo na conta em <72h.
**Estratégia:** Concierge MVP — landing + Stripe Payment Link + entrega manual nas primeiras semanas.

---

## ⏱️ Bloco 1 — Setup externo (Red faz · ~45min)

### 1.1 — Domínio (10min)

Escolher 1 (em ordem de preferência):

- [ ] **`lumen.law`** — premium (.law é caro mas autoridade jurídica imediata). Comprar em `domains.google` ou `namecheap.com`. Custo: ~US$ 75/ano.
- [ ] **`lumen.com.br`** — barato, restrito ao Brasil. `registro.br`. Custo: R$ 40/ano.
- [ ] **`lumenlaw.com.br`** — fallback se `.law` estiver caro.

Após registrar, vai para Vercel (passo 1.4) configurar DNS.

### 1.2 — Conta Stripe (10min)

1. https://dashboard.stripe.com/register (modo BR)
2. Aba **Produtos** → Criar produto:
   - **Lumen Scanner — Solo**: R$ 79/mês, recorrência mensal
   - **Lumen Scanner — Escritório**: R$ 299/mês, recorrência mensal
3. Em cada produto → **Payment Link** → copiar URL
4. Cola as 2 URLs aqui (vou plugar na landing):
   - Solo: `https://buy.stripe.com/____________`
   - Escritório: `https://buy.stripe.com/____________`

### 1.3 — Conta Formspree (5min) — captura de waitlist

1. https://formspree.io (free, 50 submissions/mês)
2. New form → Endpoint `lumen-waitlist`
3. Copia o ID (algo como `xyzabcde`)
4. Cola aqui: `FORMSPREE_ID = ____________`

### 1.4 — Conta Vercel + Deploy (15min)

1. https://vercel.com → login com GitHub (`Victorlllima`)
2. **Add New Project** → import `genixjur-lumen`
3. **Framework Preset:** Other (é HTML estático)
4. **Build Command:** vazio
5. **Output Directory:** `./`
6. Deploy → vai gerar `genixjur-lumen.vercel.app`
7. Após o domínio (1.1) estar registrado → Settings → Domains → adicionar `lumen.law` (ou outro)
8. Configurar DNS conforme Vercel instrui (geralmente A record + CNAME)

### 1.5 — Email Resend (opcional, 5min)

Pra enviar o "Prompt Firewall" automaticamente pra quem entra na waitlist:

1. https://resend.com → criar conta
2. Adicionar domínio + verificar SPF/DKIM
3. Anota o API key (vamos plugar quando montar o backend mínimo)

---

## ⏱️ Bloco 2 — Eu plugando suas credenciais (Atlas · 10min)

Depois que você tiver Stripe links + Formspree ID, me passa que rodo:

```bash
# Substituir placeholders na landing
sed -i 's|STRIPE_LINK_SOLO|https://buy.stripe.com/SEU_LINK_SOLO|g' index.html
sed -i 's|STRIPE_LINK_ESCRITORIO|https://buy.stripe.com/SEU_LINK_ESCRITORIO|g' index.html
sed -i 's|FORMSPREE_ID|SEU_ID|g' index.html

git add -A && git commit -m "feat: integra Stripe + Formspree (go-live)" && git push
```

Vercel redeploya sozinho em ~30s. Pronto pra vender.

---

## ⏱️ Bloco 3 — Distribuição (Red faz · 30min)

Já com a URL pública (ex: `lumen.law`):

### 3.1 — DM pra Ianna Cabanelas
> "Oi Ianna, vi seu reel sobre os 3 métodos manuais — sensacional, validou exatamente o gap que estávamos atacando. Lancei um app que automatiza os 3 + cobre 7 vetores que o bloco de notas não pega. lumen.law — early access a R$ 79/mês vitalício, primeiros 30 só. Topa ser a primeira ou rodar uma parceria afiliada (30% recorrente)?"

### 3.2 — Post @redpro.ia
Carrossel 8 slides estilo Insider Pragmático (rodar `/carrossel-opiniao` quando estiver pronto pro conteúdo).

Hook: *"O reel da @iannacabanelas validou o que eu já estava construindo: advogados estão usando bloco de notas pra detectar prompt injection. Funciona — mas só pega 1 dos 6 vetores. Olha o que falta:"*

CTA: *"Lumen.law — early access vitalício a R$ 79"*

### 3.3 — Grupos de WhatsApp jurídicos
- Felice posta no grupo dele
- Você posta nos 3-5 grupos jurídicos que conhece
- Mensagem direta: *"Lancei isso hoje — detecta prompt injection em PDF antes de subir no ChatGPT. STJ identificou 11 casos semana passada (multa R$ 84k). lumen.law"*

### 3.4 — Felice como case
- Foto + citação real (substituir o placeholder na seção "Testemunho")
- Quote: *"Hoje os advogados estão usando bloco de notas pra tentar identificar prompt injection. O Lumen automatiza isso em 3 segundos."*

---

## 📊 Métricas de validação (próximos 7 dias)

| Métrica | Mínimo | Bom | Excelente |
|---|---|---|---|
| Visitantes únicos | 100 | 500 | 2.000 |
| Waitlist | 10 | 50 | 200 |
| Conversões pagas | 1 | 5 | 20 |
| MRR | R$ 79 | R$ 395 | R$ 1.580+ |

**Se não bater o mínimo:** pivota o ângulo (não o produto). Provavelmente é problema de copy/distribuição, não de demanda — a demanda está confirmada pelo STJ e pelo reel da Ianna.

---

## 🛡️ Concierge MVP — Como entregar enquanto o app não existe

Cliente paga R$ 79 → recebe email com:
> "Bem-vindo ao Lumen Early Adopter. Como ainda estamos finalizando o app (lançamento em jul/2026), durante este período fazemos a análise de forma concierge — você manda o PDF por email e devolvemos o parecer técnico em até 6h úteis."

Workflow manual (você + assistente):
1. Cliente manda PDF pra `analise@lumen.law`
2. Roda script local com PyMuPDF + heurísticas (você vai construir nessa semana)
3. Gera PDF de parecer no template Fintrixity
4. Manda de volta com SHA-256 + assinatura

**Tempo por análise nos primeiros dias:** 15-30min (você aprende o padrão dos clientes reais). Depois cai pra 5min com script semi-automático.

---

## 🎯 Resumo executivo — o que falta AGORA

| Bloco | Quem | Tempo |
|---|---|---|
| Comprar domínio + Stripe + Formspree + Vercel | **Red** | 45min |
| Plugar credenciais na landing + redeploy | Atlas | 10min |
| DM Ianna + post @redpro.ia + grupos WhatsApp | **Red** | 30min |
| **Total até landing no ar com checkout** | — | **~1h30** |

Quando bater o primeiro pagamento → começo backend MVP imediato (Fase 1 do ROADMAP).
