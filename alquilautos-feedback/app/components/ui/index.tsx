"use client";

import { ReactNode, useEffect } from "react";

// ── Stars ─────────────────────────────────────────────────
export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "star-filled" : "star-empty"}>★</span>
      ))}
    </span>
  );
}

// ── Estado badge ──────────────────────────────────────────
export function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    pendiente: "badge-pending",
    aprobada:  "badge-approved",
    rechazada: "badge-rejected",
  };
  return <span className={`badge ${map[estado.toLowerCase()] ?? "badge-pending"}`}>{estado}</span>;
}

// ── Tipo badge ────────────────────────────────────────────
export function TipoBadge({ tipo }: { tipo: "vehiculo" | "propietario" | "alquilador" | string }) {
  const map: Record<string, string> = {
    vehiculo:    "badge-vehiculo",
    propietario: "badge-propietario",
    alquilador:  "badge-alquilador",
  };
  const labels: Record<string, string> = {
    vehiculo: "🚗 Vehículo", propietario: "👤 Propietario", alquilador: "🔑 Alquilador",
  };
  return <span className={`badge ${map[tipo] ?? ""}`}>{labels[tipo] ?? tipo}</span>;
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────
export function Loading() {
  return <div className="loading-center"><div className="spinner" /></div>;
}

// ── Alert ─────────────────────────────────────────────────
export function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return <div className={`alert alert-${type}`}>{message}</div>;
}

// ── Page header ───────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 13 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
