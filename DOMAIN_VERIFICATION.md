# Plano de migração: Vercel → domínio próprio + Google App Verification

> Atualizado: 2026-05-26
> Status: aguardando Red comprar o domínio

## Por que precisamos disso

Para o Google Login funcionar **sem a tela "App não verificado"** para qualquer usuário do mundo, o app precisa ser:
1. Hospedado em **domínio próprio verificado** (Google não verifica `*.vercel.app`)
2. **Aprovado** pelo OAuth Verification do Google (~4-6 dias úteis para escopos não-sensíveis)

## Pré-requisitos prontos (Atlas)

- [x] `/privacy` — Política de Privacidade LGPD-compliant
- [x] `/terms` — Termos de Uso
- [x] `/logo.svg` — Logo 120x120 quadrado SVG (versão PNG gerada no submit)
- [x] `/favicon.svg` — Favicon
- [x] Links no rodapé do `/login`

## Passos para Red (ordem importa)

### 1. Comprar o domínio (~5 min)

**Recomendação: `lumen.law`** (~$80/ano em Namecheap, Porkbun ou GoDaddy)
- TLD `.law` é restrito a profissionais do direito — credibilidade máxima
- Alternativa econômica: `lumen.com.br` (~R$ 40/ano via Registro.br)

### 2. Apontar DNS para Vercel (~5 min)

No painel da Vercel:
- Settings → Domains → Add → `lumen.law`
- Vercel mostra os DNS records que precisas adicionar no painel do registrador
- Tipicamente: 1 A record + 1 CNAME para o subdomínio `www`

### 3. Verificar o domínio no Google Search Console (~5 min)

- Abre https://search.google.com/search-console
- Add Property → tipo "Domain"
- Cola `lumen.law`
- Google dá um TXT record para adicionar no DNS
- Adiciona, espera ~5 min, clica Verify

### 4. Atualizar tudo para o novo domínio (Atlas faz via API)

Atlas atualiza automaticamente:
- Site URL no Supabase Auth
- Redirect URLs no Supabase
- Authorized JavaScript origins no Google OAuth (`https://lumen.law`)
- Env var `NEXT_PUBLIC_*` no Vercel (já são públicas, não precisa re-deploy)
- Email com SMTP customizado (no rodapé dos emails: `lumen.law`)

### 5. Submeter para OAuth Verification (Red, ~10 min)

No Google Cloud Console → OAuth consent screen → **Publish App** → preencher formulário:

- **App name**: Lumen
- **Support email**: victorlllima@gmail.com
- **App logo**: faz upload do PNG gerado a partir de `logo.svg` (120x120 mínimo)
- **App domain**:
  - Home: `https://lumen.law`
  - Privacy: `https://lumen.law/privacy`
  - Terms: `https://lumen.law/terms`
- **Authorized domains**: `lumen.law`
- **Developer contact**: victorlllima@gmail.com

Clica em **Submit for verification**.

### 6. Esperar aprovação (4-6 dias úteis)

Google verifica:
- Domínio é seu (já confirmado no Search Console)
- Privacy e Terms acessíveis
- Logo carrega
- Scopes solicitados são justificáveis (email + profile + openid = trivialmente aprovados)

Durante a espera, o app continua funcionando — só com warning de "App não verificado" para usuários novos.

### 7. Pós-aprovação

- Warning some
- Tela do Google fica clean (só "Lumen quer acessar seu nome e email · Continuar")
- Pronto para escala — sem limite de 100 test users

## Comandos Atlas para o passo 4 (quando domínio estiver vivo)

```bash
# Atualiza Supabase Auth config
NEW_DOMAIN="https://lumen.law"
PAT=$(node ~/.claude/vault/vault-read.js supabase_access_token)
PROJECT_REF=$(node ~/.claude/vault/vault-read.js --vault=lumen supabase_project_ref)

curl -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${PAT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"site_url\": \"${NEW_DOMAIN}\",
    \"uri_allow_list\": \"${NEW_DOMAIN}/auth/callback,https://www.lumen.law/auth/callback,http://localhost:3000/auth/callback\"
  }"
```

No Google Cloud Console (manual, mas trivial):
- Credenciais → editar o OAuth Client → atualizar Authorized JavaScript origins + Redirect URIs
- Trocar `https://lumen-*.vercel.app` por `https://lumen.law`

## Resumo: quem faz o quê

| Passo | Quem | Tempo |
|---|---|---|
| 1. Comprar domínio | Red | 5 min |
| 2. DNS para Vercel | Red (com guia) | 5 min |
| 3. Verificar Search Console | Red (com guia) | 5 min |
| 4. Atualizar configs | Atlas (via API) | 1 min |
| 5. Submeter verificação OAuth | Red | 10 min |
| 6. Espera Google | Google | 4-6 dias úteis |
| 7. Pós-aprovação | Atlas (deploy final) | 1 min |

**Total Red: ~25 minutos de cliques.** Tudo o que era automatizável eu já fiz.
