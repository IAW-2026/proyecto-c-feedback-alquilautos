"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Car, Key, Star, User } from "lucide-react";

// ── Stars ─────────────────────────────────────────────────
export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="stars">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={14} strokeWidth={2.5} className={i < value ? "star-filled" : "star-empty"} />
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
  return <span className={`badge ${map[estado.toLowerCase()] ?? "badge-missing"}`}>{estado}</span>;
}

// ── Tipo badge ────────────────────────────────────────────
export function TipoBadge({ tipo }: { tipo: "vehiculo" | "propietario" | "alquilador" | string }) {
  const map: Record<string, string> = {
    vehiculo:    "badge-vehiculo",
    propietario: "badge-propietario",
    alquilador:  "badge-alquilador",
  };
  const labels: Record<string, ReactNode> = {
    vehiculo: <><Car size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} /> Vehículo</>,
    propietario: <><Key size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} /> Propietario</>,
    alquilador: <><User size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} /> Alquilador</>,
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
export function PageHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 12, flexWrap: "wrap" }}>
      <div style={{ minWidth: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{title}</h1>
        {subtitle && <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 13 }}>{subtitle}</p>}
      </div>
      {action && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-end", minWidth: 0 }}>
          {action}
        </div>
      )}
    </div>
  );
}

type EntityType = "vehiculo" | "propietario" | "alquilador";

const ENTITY_TOOLTIP_CACHE = new Map<string,Record<string, unknown>>();

function getEntityFetchUrl(type: EntityType, id: number | string) {
  if (!id) return undefined;
  if (type === "vehiculo") return `/api/proxy/seller/api/vehiculo/${id}`;
  if (type === "propietario") return `/api/proxy/seller/api/propietario/${id}`;
  if (type === "alquilador") return `/api/proxy/buyer/api/alquilador/${id}`;
  return undefined;
}

function TooltipContent({ data, type }: {
  data: Record<string, unknown>;
  type: EntityType;
}) {
  if (data && typeof data.error === "string") {
    return (
      <div style={{ 
        display: "flex", flexDirection: "column", gap: 4, 
        color: "#ef4444", maxWidth: 200, whiteSpace: "normal" 
      }}>
        <strong style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={16} /> Error al cargar
        </strong>
        <div style={{ fontSize: "0.85em" }}>{data.error}</div>
      </div>
    );
  }
  if (type === "vehiculo") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Car size={16} /> {String(data.marca)} {String(data.modelo)}
        </strong>
        <div>ID: {String(data.idVehiculo)}</div>
        <div>Propietario: #{String(data.idPropietario)}</div>
        <div>Precio: ${String(data.precio)}</div>
      </div>
    );
  }
  if (type === "propietario") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Key size={16} /> {String(data.nombre)} {String(data.apellido)}
        </strong>
        <div>Email: {String(data.email)}</div>
        <div>DNI: {String(data.dni)}</div>
        <div>ID: {String(data.idPropietario)}</div>
      </div>
    );
  }
  if (type === "alquilador") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <User size={16} /> {String(data.nombre)} {String(data.apellido)}
        </strong>
        <div>Email: {String(data.email)}</div>
        <div>DNI: {String(data.dni)}</div>
        <div>Licencia: {String(data.licenciaConducir)}</div>
        <div>ID: {String(data.idAlquilador)}</div>
      </div>
    );
  }
  return (
    <pre style={{ margin: 0 }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function getEntityDisplayName(data: Record<string, unknown>, type: EntityType): string {
  if (type === "vehiculo" && data.marca && data.modelo) return `${data.marca} ${data.modelo}`;
  if (type !== "vehiculo" && data.nombre && data.apellido) return `${data.nombre} ${data.apellido}`;
  return "";
}

export function EntityTooltipLabel({ text, tooltip, entityType, entityId, maxW = 260, showName }: {
  text: string; tooltip?: string; entityType?: EntityType; entityId?: number | string; maxW?: number; showName?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entityData, setEntityData] = useState<Record<string, unknown> | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const fetchUrl = entityType && entityId ? getEntityFetchUrl(entityType, entityId) : undefined;
  const cacheKey = fetchUrl ?? "";

  // ── Eager fetch cuando showName=true ────────────
  useEffect(() => {
    if (!showName || !fetchUrl || entityData) return;
    if (ENTITY_TOOLTIP_CACHE.has(cacheKey)) {
      setEntityData(ENTITY_TOOLTIP_CACHE.get(cacheKey) ?? null);
      return;
    }
    setLoading(true);
    fetch(fetchUrl)
      .then(async res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { ENTITY_TOOLTIP_CACHE.set(cacheKey, data); setEntityData(data); })
      .catch(() => setEntityData({ error: `Información de ${entityType} #${entityId}` }))
      .finally(() => setLoading(false));
  }, [showName, fetchUrl, cacheKey, entityData, entityType, entityId]);

  useEffect(() => {
  if (!show || entityData || !fetchUrl) return;

  if (ENTITY_TOOLTIP_CACHE.has(cacheKey)) {
    setEntityData( ENTITY_TOOLTIP_CACHE.get(cacheKey) ?? null );
    return;
  }

  let active = true;
  setLoading(true);
  fetch(fetchUrl)
      .then(async res => {
        if (!res.ok) { throw new Error(); }
        return res.json();
      })
      .then(data => {
        if (!active) return;
        ENTITY_TOOLTIP_CACHE.set(cacheKey, data);
        setEntityData(data);
      })
      .catch(() => {
        if (!active) return;
        setEntityData({ error: `Información de ${entityType} #${entityId}` });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [show, fetchUrl, cacheKey, entityData, entityType, entityId]);

  const displayName = showName && entityType && entityData && !entityData.error
    ? getEntityDisplayName(entityData, entityType)
    : "";
  const visibleText = displayName || (showName && !entityData ? "Cargando..." : text);
  const hasContent = tooltip || entityData;

  const handleEnter = () => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setCoords({ left: r.left + window.scrollX, top: r.top + window.scrollY });
    }
    setShow(true);
  };
  const handleLeave = () => setShow(false);

  return (
    <>
      <span
        ref={anchorRef}
        style={{ position: "relative", display: "inline-block", maxWidth: maxW, cursor: "help", textDecoration: "underline dotted" }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span style={{ color: "inherit" }}>{visibleText}</span>
      </span>

      {typeof document !== "undefined" && show && hasContent && createPortal(
        <div
          ref={tooltipRef}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          style={{
            position: "absolute",
            left: coords.left,
            top: coords.top,
            transform: "translateY(-100%)",
            zIndex: 999999,
            minWidth: 220,
            background: "#1a1d27",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
            fontSize: 12,
            color: "var(--text)",
            whiteSpace: "normal",
            maxWidth: 340,
            boxShadow: "var(--shadow)",
            lineHeight: 1.5,
            pointerEvents: "auto",
          }}
        >
          {loading ? ("Cargando...") : tooltip ? (tooltip) : (<TooltipContent data={entityData!} type={entityType!} />)}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Confirm Modal ─────────────────────────────────────────
export function ConfirmModal({
  title, message, isOpen, onConfirm, onClose,
  confirmText = "Confirmar", cancelText = "Cancelar", variant = "danger",
}: {
  title: string; message: string; isOpen: boolean; onConfirm: () => void;
  onClose: () => void; confirmText?: string; cancelText?: string; variant?: "danger" | "primary";
}) {
  if (!isOpen) return null;
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>{cancelText}</button>
          <button className={`btn btn-${variant}`} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</button>
        </div>
      }
    >
      <div style={{ padding: "10px 0" }}>
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>{message}</p>
      </div>
    </Modal>
  );
}

// ── Texto truncado con tooltip ────────────────────────────
export function Truncated({ text, maxW = 260 }: { text: string; maxW?: number }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const [overflow, setOverflow] = useState(false);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setOverflow(el.scrollWidth > el.clientWidth);
  }, [text, maxW]);

  const handleEnter = () => {
    const anchor = anchorRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setCoords({ left: rect.left + window.scrollX, top: rect.top + window.scrollY });
    }
    setShow(true);
  };

  return (
    <>
      <span
        ref={anchorRef}
        style={{ position: "relative", display: "inline-block", maxWidth: maxW, 
                 textDecoration: overflow ? "underline" : "none", cursor: overflow ? "help" : "default", }}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
      >
        <span
          ref={textRef}
          style={{
            display: "block", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {text}
        </span>
      </span>

      {typeof document !== "undefined" && show && overflow && createPortal(
        <span
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          style={{
            position: "absolute",
            left: coords.left,
            top: coords.top,
            transform: "translateY(-100%)",
            zIndex: 9999,
            background: "#1a1d27",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 12px",
            fontSize: 12,
            color: "var(--text)",
            whiteSpace: "normal",
            maxWidth: 320,
            boxShadow: "var(--shadow)",
            lineHeight: 1.5,
            marginBottom: 4,
            pointerEvents: "auto",
          }}
        >
          {text}
        </span>,
        document.body
      )}
    </>
  );
}