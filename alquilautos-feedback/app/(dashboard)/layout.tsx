"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const NAV_ITEMS = [
  { href: "/moderacion", label: "Moderación", icon: "🛡️", desc: "Aprobar / Rechazar reseñas" },
  { href: "/resenas",    label: "Reseñas",    icon: "⭐", desc: "Listado completo" },
  { href: "/entidades",  label: "Entidades",  icon: "🗂️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        width: 240,
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
            AlquilAutos
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Feedback App
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: 2,
                  background: active ? "var(--primary-light)" : "transparent",
                  color: active ? "var(--primary)" : "var(--text-muted)",
                  textDecoration: "none",
                  fontWeight: active ? 600 : 400,
                  fontSize: 13,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <UserButton />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Mi cuenta</span>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
