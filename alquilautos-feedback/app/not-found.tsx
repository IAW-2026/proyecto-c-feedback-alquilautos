import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{
          fontSize: 80, fontWeight: 900,
          color: "var(--border-light)",
          lineHeight: 1, marginBottom: 16,
        }}>
          404
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Página no encontrada
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.6 }}>
          La dirección que buscás no existe o fue movida.
        </p>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--primary)", color: "#fff",
          padding: "10px 24px", borderRadius: "var(--radius-sm)",
          textDecoration: "none", fontSize: 14, fontWeight: 500,
        }}>
          <ArrowLeft size={14} /> Volver al panel
        </Link>
      </div>
    </div>
  );
}