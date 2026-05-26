import Link from "next/link";

export const metadata = {
  title: "Termos de Uso · Lumen",
  description: "Termos de Uso do Lumen — análise forense de documentos jurídicos.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 760, margin: "0 auto" }}>
      <Link href="/" style={{ color: "var(--text-2)", fontSize: 13, textDecoration: "none" }}>
        ← Voltar
      </Link>

      <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 24, marginBottom: 4 }}>
        Termos de Uso
      </h1>
      <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 40 }}>
        Última atualização: 26 de maio de 2026
      </p>

      <Section title="1. Aceitação">
        <p>
          Ao criar uma conta ou utilizar o Lumen (&quot;Serviço&quot;), você (&quot;Usuário&quot;)
          declara ter lido, compreendido e aceito integralmente estes Termos de Uso e a{" "}
          <Link href="/privacy" style={{ color: "var(--accent)" }}>Política de Privacidade</Link>.
        </p>
      </Section>

      <Section title="2. Sobre o Serviço">
        <p>
          O Lumen é uma ferramenta de análise forense que identifica tentativas de manipulação
          (&quot;prompt injection&quot;) em documentos em formato PDF, voltada principalmente para
          profissionais do direito que utilizam sistemas de inteligência artificial em sua rotina.
        </p>
        <p>
          O Serviço produz um <strong>Parecer Técnico</strong> indicando se um documento contém
          padrões compatíveis com técnicas conhecidas de injection. Este Parecer é{" "}
          <strong>orientativo e técnico</strong>, não constitui prova pericial em sentido estrito,
          nem substitui análise jurídica ou perícia oficial.
        </p>
      </Section>

      <Section title="3. Cadastro e segurança da conta">
        <p>
          O cadastro exige e-mail válido. O Usuário é responsável pela confidencialidade de suas
          credenciais e por todas as atividades realizadas em sua conta. Compromete-se a notificar
          imediatamente o Lumen sobre qualquer uso não autorizado.
        </p>
      </Section>

      <Section title="4. Planos e pagamento">
        <p>
          Os planos vigentes estão disponíveis em <Link href="/" style={{ color: "var(--accent)" }}>nossa página inicial</Link>.
          Os pagamentos são processados pela Stripe. Não armazenamos dados de cartão.
        </p>
        <p>
          Assinaturas são cobradas no início de cada ciclo. O Usuário pode cancelar a qualquer
          momento pelo painel — o cancelamento entra em vigor ao fim do ciclo já pago, sem reembolso
          proporcional, salvo previsão expressa do CDC.
        </p>
        <p>
          A modalidade <strong>Early Adopter Vitalício</strong> garante ao Usuário, ao tempo da
          assinatura, valor congelado pelo prazo de vigência do plano contratado, conforme oferta
          específica vigente à época do cadastro.
        </p>
      </Section>

      <Section title="5. Uso aceitável">
        <p>O Usuário compromete-se a NÃO:</p>
        <ul>
          <li>Utilizar o Serviço para fins ilícitos ou em violação a direitos de terceiros</li>
          <li>Submeter documentos sobre os quais não detenha autorização legal para análise</li>
          <li>Realizar engenharia reversa, scraping ou tentativa de burlar limites técnicos</li>
          <li>Usar o Serviço para treinar modelos concorrentes de IA</li>
          <li>Revender, redistribuir ou expor o Serviço a terceiros sem contrato específico</li>
        </ul>
      </Section>

      <Section title="6. Limitações de responsabilidade">
        <p>
          O Parecer Técnico fornecido é resultado de análise estática e semântica automatizada e
          tem <strong>natureza orientativa</strong>. O Lumen não se responsabiliza por:
        </p>
        <ul>
          <li>Decisões processuais, comerciais ou contratuais tomadas com base exclusivamente no Parecer</li>
          <li>Falsos positivos ou falsos negativos inerentes a sistemas de detecção automatizada</li>
          <li>Manipulações realizadas por técnicas novas ainda não cobertas pelo Serviço</li>
          <li>Indisponibilidade pontual decorrente de manutenção, falhas de provedores ou força maior</li>
        </ul>
        <p>
          O Lumen disponibiliza o Serviço &quot;como está&quot;, com SLA de melhor esforço de 99% de uptime
          mensal. Em qualquer hipótese, a responsabilidade do Lumen fica limitada ao valor pago pelo
          Usuário nos últimos 12 meses.
        </p>
      </Section>

      <Section title="7. Propriedade intelectual">
        <p>
          Todo o código, marca, layout, conteúdo editorial e algoritmos do Lumen são de propriedade
          da HubTech AI Ltda. e protegidos pela Lei 9.610/98 e Lei 9.279/96. É vedada qualquer
          reprodução total ou parcial sem autorização expressa.
        </p>
        <p>
          O Usuário mantém todos os direitos sobre os documentos que submeter. Concede ao Lumen
          licença limitada e temporária <strong>apenas para o tempo de processamento da análise</strong>.
        </p>
      </Section>

      <Section title="8. Modificações">
        <p>
          O Lumen pode modificar estes Termos a qualquer momento. Alterações materiais serão
          comunicadas por e-mail com 30 dias de antecedência. O uso continuado do Serviço após a
          vigência implica aceitação dos novos termos.
        </p>
      </Section>

      <Section title="9. Encerramento">
        <p>
          O Lumen pode suspender ou encerrar a conta de Usuário que violar estes Termos, sem aviso
          prévio em casos de fraude, ato ilícito ou descumprimento grave. O Usuário pode encerrar
          sua conta a qualquer momento pelo painel.
        </p>
      </Section>

      <Section title="10. Lei aplicável e foro">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
          da Comarca de São Paulo/SP, com renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
      </Section>

      <Section title="11. Contato">
        <p>
          Dúvidas sobre estes Termos: <a href="mailto:juridico@lumen.law">juridico@lumen.law</a>
        </p>
      </Section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-3)" }}>
        © 2026 HubTech AI Ltda. · <Link href="/privacy" style={{ color: "var(--accent)" }}>Política de Privacidade</Link>
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
