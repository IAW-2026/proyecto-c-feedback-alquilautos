"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

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
        maxWidth: 480,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <AlertTriangle size={48} color="var(--danger)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
          Algo salió mal
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.6 }}>
          {error.message || "Ocurrió un error inesperado. Podés intentar recargar."}
        </p>
        {error.digest && (
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 24, fontFamily: "monospace" }}>
            Código: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            <RotateCw size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Reintentar
          </button>
          <a href="/" className="btn btn-ghost">
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}