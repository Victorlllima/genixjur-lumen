export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Row types — usados como cast explícito nas páginas
export type AnalysisRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_size_bytes: number;
  sha256: string;
  page_count: number;
  has_injection: boolean;
  overall_severity: Severity;
  duration_ms: number;
  semantic_used: boolean;
  scanned_at: string;
  created_at: string;
};

export type FindingRow = {
  id: string;
  analysis_id: string;
  technique: Technique;
  severity: Severity;
  confidence: number;
  page: number | null;
  bbox: Json | null;
  text_excerpt: string | null;
  reconstructed_command: string | null;
  notes: string | null;
  semantic_verdict: SemanticVerdict | null;
  semantic_confidence: number | null;
  semantic_reasoning: string | null;
  created_at: string;
};

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type Technique =
  | "white_text"
  | "micro_font"
  | "off_page"
  | "zero_width_chars"
  | "metadata"
  | "ocg_layer";
export type SemanticVerdict = "injection" | "watermark_legitimo" | "falso_positivo";
export type Plan = "free" | "solo" | "escritorio" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          oab_number: string | null;
          plan: Plan;
          analyses_used_this_month: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          oab_number?: string | null;
          plan?: Plan;
          analyses_used_this_month?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          oab_number?: string | null;
          plan?: Plan;
          analyses_used_this_month?: number;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_size_bytes: number;
          sha256: string;
          page_count: number;
          has_injection: boolean;
          overall_severity: Severity;
          duration_ms: number;
          semantic_used: boolean;
          scanned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_size_bytes: number;
          sha256: string;
          page_count: number;
          has_injection: boolean;
          overall_severity: Severity;
          duration_ms: number;
          semantic_used?: boolean;
          scanned_at: string;
          created_at?: string;
        };
        Update: {
          file_name?: string;
          has_injection?: boolean;
          overall_severity?: Severity;
        };
      };
      findings: {
        Row: {
          id: string;
          analysis_id: string;
          technique: Technique;
          severity: Severity;
          confidence: number;
          page: number | null;
          bbox: Json | null;
          text_excerpt: string | null;
          reconstructed_command: string | null;
          notes: string | null;
          semantic_verdict: SemanticVerdict | null;
          semantic_confidence: number | null;
          semantic_reasoning: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          technique: Technique;
          severity: Severity;
          confidence: number;
          page?: number | null;
          bbox?: Json | null;
          text_excerpt?: string | null;
          reconstructed_command?: string | null;
          notes?: string | null;
          semantic_verdict?: SemanticVerdict | null;
          semantic_confidence?: number | null;
          semantic_reasoning?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["findings"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: Plan;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: Plan;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      severity: Severity;
      technique: Technique;
      plan: Plan;
    };
    CompositeTypes: Record<string, never>;
  };
};
