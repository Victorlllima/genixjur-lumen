-- ============================================================
-- Lumen Scanner — Schema inicial
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
-- Extensão da tabela auth.users com dados do plano

CREATE TABLE IF NOT EXISTS profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    oab_number  TEXT,                          -- CNA/OAB opcional
    plan        TEXT NOT NULL DEFAULT 'free'   -- free | solo | escritorio | enterprise
                CHECK (plan IN ('free', 'solo', 'escritorio', 'enterprise')),
    analyses_used_this_month INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: usuário só vê e edita o próprio perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar profile automático ao cadastrar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ─── Analyses ─────────────────────────────────────────────────────────────────
-- Cada análise = um arquivo PDF processado

CREATE TABLE IF NOT EXISTS analyses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256          CHAR(64) NOT NULL,
    page_count      INT NOT NULL DEFAULT 1,
    has_injection   BOOLEAN NOT NULL DEFAULT FALSE,
    overall_severity TEXT NOT NULL DEFAULT 'INFO'
                    CHECK (overall_severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
    duration_ms     INT NOT NULL DEFAULT 0,
    semantic_used   BOOLEAN NOT NULL DEFAULT FALSE,
    scanned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX idx_analyses_user_id ON analyses (user_id, created_at DESC);
CREATE INDEX idx_analyses_sha256   ON analyses (sha256);
CREATE INDEX idx_analyses_severity ON analyses (overall_severity) WHERE has_injection = TRUE;

-- RLS: usuário só vê suas próprias análises
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_select_own" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analyses_insert_own" ON analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── Findings ─────────────────────────────────────────────────────────────────
-- Cada finding = uma ocorrência dentro de uma análise

CREATE TABLE IF NOT EXISTS findings (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id           UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    technique             TEXT NOT NULL
                          CHECK (technique IN ('white_text','micro_font','off_page',
                                               'zero_width_chars','metadata','ocg_layer')),
    severity              TEXT NOT NULL
                          CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW','INFO')),
    confidence            NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    page                  INT,
    bbox                  JSONB,               -- [x0, y0, x1, y1]
    text_excerpt          TEXT,
    reconstructed_command TEXT,
    notes                 TEXT,
    -- Campos semânticos (Haiku)
    semantic_verdict      TEXT CHECK (semantic_verdict IN
                          ('injection','watermark_legitimo','falso_positivo', NULL)),
    semantic_confidence   NUMERIC(4,3) CHECK (semantic_confidence BETWEEN 0 AND 1),
    semantic_reasoning    TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_findings_analysis_id ON findings (analysis_id);
CREATE INDEX idx_findings_technique   ON findings (technique);
CREATE INDEX idx_findings_severity    ON findings (severity);

-- RLS via join com analyses (usuário só vê findings das próprias análises)
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "findings_select_own" ON findings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = findings.analysis_id
              AND analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "findings_insert_own" ON findings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM analyses
            WHERE analyses.id = findings.analysis_id
              AND analyses.user_id = auth.uid()
        )
    );

-- ─── Subscriptions ─────────────────────────────────────────────────────────────
-- Estado do plano Stripe

CREATE TABLE IF NOT EXISTS subscriptions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id   TEXT,
    stripe_subscription_id TEXT,
    plan                 TEXT NOT NULL DEFAULT 'free'
                         CHECK (plan IN ('free', 'solo', 'escritorio', 'enterprise')),
    status               TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end   TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions (stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- ─── Updated_at automático ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
