"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/moderacion", label: "Moderación", icon: "🛡️", desc: "Aprobar / Rechazar reseñas" },
  { href: "/resenas",    label: "Reseñas",    icon: "⭐", desc: "Listado completo" },
  { href: "/entidades",  label: "Entidades",  icon: "🗂️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const [open, setOpen]       = useState(false);
  const [mobile, setMobile]   = useState(false);
 
  // Detectar si es mobile
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
 
  // Cerrar sidebar al navegar en mobile
  useEffect(() => { if (mobile) setOpen(false); }, [pathname, mobile]);
 
  const sidebarStyle: React.CSSProperties = {
    width: 240,
    background: "var(--bg-card)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    // En mobile: posición fija con slide desde la izquierda
    ...(mobile ? {
      position: "fixed",
      top: 0,
      left: open ? 0 : -240,
      height: "100vh",
      zIndex: 200,
      transition: "left 0.25s ease",
    } : {}),
  };
 
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
 
      {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
      {mobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 199,
          }}
        />
      )}
 
      {/* ── Sidebar ── */}
      <aside style={sidebarStyle}>
        {/* Branding */}
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>🚗 AlquilAutos</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Feedback App</div>
          </div>
          {/* Botón cerrar en mobile */}
          {mobile && (
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 22, cursor: "pointer", padding: 4, lineHeight: 1 }}
            >
              ×
            </button>
          )}
        </div>
 
        {/* Nav */}
        <nav style={{ padding: "10px 10px", flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: "var(--radius-sm)",
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
                {item.label}
              </Link>
            );
          })}
        </nav>
 
        {/* Usuario */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <UserButton />
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Mi cuenta</span>
        </div>
      </aside>
 
      {/* ── Main ── */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minHeight: "100vh", minWidth: 0 }}>
        {/* Barra superior en mobile con hamburger */}
        {mobile && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 24, paddingBottom: 16,
            borderBottom: "1px solid var(--border)",
          }}>
            <button
              onClick={() => setOpen(true)}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", color: "var(--text)",
                width: 38, height: 38, fontSize: 18, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ☰
            </button>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              🚗 AlquilAutos Feedback
            </div>
          </div>
        )}
 
        {children}
      </main>
    </div>
  );
}