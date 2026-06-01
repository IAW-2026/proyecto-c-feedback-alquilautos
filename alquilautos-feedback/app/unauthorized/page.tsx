"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

export default function Unauthorized() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "40px 48px",
        textAlign: "center",
        maxWidth: 420,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Lock size={48} color="var(--danger)" />
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Acceso no autorizado
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 32 }}>
          No tenés permisos para ver esta página.
          Si creés que es un error, cerrá sesión e ingresá con otra cuenta.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", color: "var(--text-muted)",
            border: "1px solid var(--border)",
            padding: "9px 20px", borderRadius: "var(--radius-sm)",
            textDecoration: "none", fontSize: 13, fontWeight: 500,
          }}>
            <ArrowLeft size={14} /> Volver al inicio
          </Link>

          <SignOutButton redirectUrl="/">
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--danger)", color: "#fff", border: "none",
              padding: "9px 20px", borderRadius: "var(--radius-sm)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}>
              Cerrar sesión
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
