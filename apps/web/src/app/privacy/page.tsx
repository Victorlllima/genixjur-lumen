import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade · Lumen",
  description: "Política de Privacidade do Lumen — análise forense de documentos jurídicos.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 760, margin: "0 auto" }}>
      <Link href="/" style={{ color: "var(--text-2)", fontSize: 13, textDecoration: "none" }}>
        ← Voltar
      </Link>

      <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 24, marginBottom: 4 }}>
        Política de Privacidade
      </h1>
      <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 40 }}>
        Última atualização: 26 de maio de 2026
      </p>

      <Section title="1. Quem somos">
        <p>
          O Lumen (&quot;Serviço&quot;) é operado por <strong>HubTech AI Ltda.</strong>,
          inscrita no CNPJ sob nº [pendente], com sede em [endereço pendente]. Para qualquer
          questão relativa a esta política, contate <a href="mailto:privacidade@lumen.law">privacidade@lumen.law</a>.
        </p>
      </Section>

      <Section title="2. Dados coletados">
        <p>Coletamos as seguintes categorias de dados pessoais:</p>
        <ul>
          <li><strong>Cadastro:</strong> e-mail, nome (quando informado pelo OAuth do Google ou Microsoft), número da OAB (opcional)</li>
          <li><strong>Uso do Serviço:</strong> arquivos PDF enviados para análise, metadados dos arquivos, resultado das análises (findings), data e hora de cada operação</li>
          <li><strong>Técnicos:</strong> endereço IP, user agent, identificadores de sessão (cookies de autenticação)</li>
          <li><strong>Pagamento:</strong> processado integralmente pela Stripe; não armazenamos dados de cartão. Mantemos apenas o identificador de assinatura.</li>
        </ul>
      </Section>

      <Section title="3. Base legal (LGPD)">
        <p>Tratamos dados pessoais com base em:</p>
        <ul>
          <li><strong>Execução de contrato</strong> (Art. 7º, V da LGPD): para fornecer a análise de documentos contratada</li>
          <li><strong>Legítimo interesse</strong>: para segurança, prevenção a fraude e melhoria do Serviço</li>
          <li><strong>Consentimento</strong>: para comunicações de marketing (opt-in)</li>
        </ul>
      </Section>

      <Section title="4. O que fazemos com os documentos enviados">
        <p>
          <strong>Princípio da minimização (LGPD Art. 6º, III):</strong> os PDFs enviados para análise
          são processados em memória pelos servidores do Serviço e <strong>excluídos imediatamente após
          a conclusão da análise</strong>. Não mantemos cópia do documento original em disco nem em backups.
        </p>
        <p>
          Armazenamos apenas o resultado da análise (findings, severidade, hash SHA-256 do arquivo original
          para fins de auditoria e cadeia de custódia). O hash não permite reconstrução do documento.
        </p>
      </Section>

      <Section title="5. Subprocessadores">
        <p>Compartilhamos dados com os seguintes subprocessadores, contratualmente vinculados:</p>
        <ul>
          <li><strong>Supabase Inc.</strong> (banco de dados e autenticação) — Estados Unidos · cláusulas-padrão de transferência internacional</li>
          <li><strong>Fly.io</strong> (hospedagem da API) — região São Paulo, Brasil</li>
          <li><strong>Vercel Inc.</strong> (hospedagem do frontend) — edge no Brasil</li>
          <li><strong>Anthropic PBC</strong> (Claude API, opcional para análise semântica) — trechos suspeitos podem ser enviados; documento integral nunca é compartilhado</li>
          <li><strong>Stripe Inc.</strong> (pagamentos) — dados de cartão processados diretamente, fora dos nossos sistemas</li>
          <li><strong>Google LLC</strong> (OAuth, opcional) — apenas e-mail e nome quando o usuário escolhe esta forma de autenticação</li>
        </ul>
      </Section>

      <Section title="6. Direitos do titular (LGPD Art. 18)">
        <p>
          Você tem direito a: confirmação de tratamento, acesso, correção, anonimização, portabilidade,
          eliminação, informação sobre compartilhamento, e revogação do consentimento. Para exercer
          qualquer destes direitos, escreva para <a href="mailto:privacidade@lumen.law">privacidade@lumen.law</a>
          {" "}— responderemos em até 15 dias.
        </p>
      </Section>

      <Section title="7. Retenção">
        <ul>
          <li>Dados de cadastro: enquanto a conta estiver ativa + 5 anos após encerramento (obrigação legal)</li>
          <li>Resultados de análises: enquanto a conta estiver ativa; usuário pode excluir individualmente</li>
          <li>PDFs enviados: deletados imediatamente após análise (não retidos)</li>
          <li>Logs de acesso: 6 meses (Art. 15 do Marco Civil da Internet)</li>
        </ul>
      </Section>

      <Section title="8. Segurança">
        <p>
          Empregamos criptografia TLS 1.3 em trânsito, criptografia em repouso para o banco de dados,
          Row-Level Security (RLS) no PostgreSQL, autenticação multifator opcional, e controle de
          acesso via JWT com refresh token rotation. Auditoria contínua de dependências para CVEs.
        </p>
      </Section>

      <Section title="9. Cookies">
        <p>
          Utilizamos cookies estritamente necessários (autenticação e sessão). Não usamos cookies
          de rastreamento publicitário nem cookies de terceiros não essenciais.
        </p>
      </Section>

      <Section title="10. Encarregado de Proteção de Dados (DPO)">
        <p>
          O Encarregado é <strong>[a definir]</strong>, contato:{" "}
          <a href="mailto:dpo@lumen.law">dpo@lumen.law</a>.
        </p>
      </Section>

      <Section title="11. Alterações">
        <p>
          Esta Política pode ser atualizada. A versão vigente será sempre publicada nesta URL com
          data de última atualização. Alterações materiais serão notificadas por e-mail aos usuários
          ativos com 30 dias de antecedência.
        </p>
      </Section>

      <Section title="12. Foro">
        <p>
          Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer questões oriundas
          desta Política, com renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
      </Section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-3)" }}>
        © 2026 HubTech AI Ltda. · <Link href="/terms" style={{ color: "var(--accent)" }}>Termos de Uso</Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "var(--accent)" }}>
        {title}
      </h2>
      <div style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}
