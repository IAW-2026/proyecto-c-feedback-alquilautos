"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 24px",
    }}>
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--danger)",
        borderRadius: "var(--radius)",
        padding: "32px 40px",
        textAlign: "center",
        maxWidth: 440,
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Error al cargar esta sección
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
          {error.message || "Ocurrió un error inesperado. El resto del panel sigue funcionando."}
        </p>
        <button onClick={reset} className="btn btn-primary">
          ↻ Reintentar
        </button>
      </div>
    </div>
  );
}