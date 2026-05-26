"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, FileSearch, LayoutDashboard, LogOut, Zap } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Análises", icon: LayoutDashboard },
  { href: "/analyze",   label: "Nova análise", icon: FileSearch },
];

export default function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "var(--card)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "20px 12px",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ padding: "4px 8px 20px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={18} color="var(--accent)" strokeWidth={2.5} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.3px" }}>
            LUMEN
          </span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2, paddingLeft: 26 }}>
          Scanner Forense
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--text)" : "var(--text-2)",
                background: active ? "rgba(232,68,10,0.12)" : "transparent",
                border: active ? "1px solid rgba(232,68,10,0.2)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Plano badge */}
      <div style={{
        margin: "8px 0",
        padding: "10px",
        background: "rgba(232,68,10,0.08)",
        border: "1px solid rgba(232,68,10,0.15)",
        borderRadius: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Zap size={12} color="var(--accent)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)" }}>EARLY ADOPTER</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-2)" }}>Acesso vitalício · R$ 79</div>
      </div>

      {/* Usuário + logout */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
        {userEmail && (
          <div style={{
            fontSize: 11,
            color: "var(--text-3)",
            marginBottom: 8,
            padding: "0 4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {userEmail}
          </div>
        )}
        <button
          onClick={signOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            width: "100%",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "var(--text-3)",
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </aside>
  );
}
