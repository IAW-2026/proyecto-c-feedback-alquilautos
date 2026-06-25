"use client";

import { useState, useCallback, useEffect } from "react";
import { Stars, EstadoBadge, TipoBadge, Alert, Loading, PageHeader, EntityTooltipLabel } from "@/app/components/ui";
import { ArrowRight, Check, CheckCircle2, RefreshCcw, Shield, X } from "lucide-react";
import { ResenaCompleta, ModeracionCompleta, getTipo, shortenId } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────
const AVATAR_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ec4899",
  "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4",
];

function avatarColor(id: number | string) {
  const text = String(id);
  const hash = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getReceptorLabel(r: ResenaCompleta) {
  if (r.resenaVehiculo)    return `#${shortenId(r.resenaVehiculo.idVehiculo)}`;
  if (r.resenaPropietario) return `#${shortenId(r.resenaPropietario.idPropietario)}`;
  if (r.resenaAlquilador)  return `#${shortenId(r.resenaAlquilador.idAlquilador)}`;
  return "—";
}

function getReceptorEntity(r: ResenaCompleta) {
  if (r.resenaVehiculo) return { type: "vehiculo" as const, id: r.resenaVehiculo.idVehiculo };
  if (r.resenaPropietario) return { type: "propietario" as const, id: r.resenaPropietario.idPropietario };
  if (r.resenaAlquilador) return { type: "alquilador" as const, id: r.resenaAlquilador.idAlquilador };
  return null;
}

// ── Card individual ───────────────────────────────────────
function ModeracionCard({
  m,
  onRefresh,
  onDetail,
}: {
  m: ModeracionCompleta;
  onRefresh: () => void;
  onDetail: (m: ModeracionCompleta) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [motivo, setMotivo]       = useState("");
  const [acting, setActing]       = useState(false);
  const [err, setErr]             = useState("");

  const pending = m.estado === "PENDIENTE";
  const color   = avatarColor(m.resena.idEmisor);
  const tipo    = getTipo(m.resena);

  const resolver = async (estado: "APROBADA" | "RECHAZADA") => {
    if (estado === "RECHAZADA" && !motivo.trim()) {
      setErr("El motivo es requerido para rechazar");
      return;
    }
    setActing(true);
    setErr("");
    try {
      const res = await fetch("/api/moderacion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idResena: m.idResena,
          estado: estado,
          motivo: motivo || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onRefresh();
    } catch (e) {
      setErr((e as Error).message);
      setActing(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: pending ? 1 : 0.65,
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4)";
        e.currentTarget.style.borderColor = "var(--border-light)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* ── Header: avatar + emisor + estrellas ── */}
      <div style={{ padding: "16px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: color, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 15, overflow: "hidden",
          }}>
            {shortenId(m.resena.idEmisor)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              <EntityTooltipLabel
                text={`#${shortenId(m.resena.idEmisor)}`}
                entityType={tipo === "alquilador" ? "propietario" : "alquilador"}
                entityId={m.resena.idEmisor}
                showName
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              Reserva #{m.resena.idReserva} · {new Date(m.fechaCreacion).toLocaleDateString("es-AR")}
            </div>
          </div>
        </div>
        <Stars value={m.resena.calificacionGeneral} />
      </div>

      {/* ── Tipo + receptor ── */}
      <div style={{ padding: "0 18px 10px", display: "flex", gap: 8, alignItems: "center" }}>
        <TipoBadge tipo={tipo} />
        <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
        <span style={{ fontSize: 12, color: "var(--text-light)" }}>
          {(() => {
            const receptor = getReceptorEntity(m.resena);
            return receptor ? (
              <EntityTooltipLabel
                text={getReceptorLabel(m.resena)}
                entityType={receptor.type}
                entityId={receptor.id}
                showName
              />
            ) : getReceptorLabel(m.resena);
          })()
        }</span>
      </div>

      {/* ── Descripción ── */}
      <div style={{ padding: "0 18px 16px", flex: 1 }}>
        <p style={{
          fontSize: 13, lineHeight: 1.65, fontStyle: "italic",
          color: "var(--text-light)",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
        }}>
          "{m.resena.descripcion}"
        </p>
      </div>

      {/* ── Input de rechazo inline ── */}
      {rejecting && (
        <div style={{ padding: "0 18px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
          <input
            className="form-input"
            placeholder="Motivo del rechazo (requerido)"
            value={motivo}
            onChange={e => { setMotivo(e.target.value); setErr(""); }}
            autoFocus
          />
          {err && <span style={{ fontSize: 11, color: "var(--danger)" }}>{err}</span>}
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        padding: "11px 18px",
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onDetail(m)}
          style={{ marginRight: "auto" }}
        >
          Ver detalle
        </button>

        {pending && !rejecting && (
          <>
            <button
              className="btn btn-sm"
              style={{ background: "var(--success)", color: "#fff", border: "none" }}
              onClick={() => resolver("APROBADA")}
              disabled={acting}
            >
              {acting ? "..." : <><Check size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Aprobar</>}
            </button>
            <button
              className="btn btn-sm"
              style={{ background: "transparent", color: "var(--danger)", border: `1px solid var(--danger)` }}
              onClick={() => { setRejecting(true); setMotivo(""); }}
            >
              <><X size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Rechazar</>
            </button>
          </>
        )}

        {pending && rejecting && (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setRejecting(false); setMotivo(""); setErr(""); }}
              disabled={acting}
            >
              Cancelar
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => resolver("RECHAZADA")}
              disabled={acting}
            >
              {acting ? "..." : <><X size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Confirmar</>}
            </button>
          </>
        )}

        {!pending && <EstadoBadge estado={m.estado} />}
      </div>
    </div>
  );
}

// ── Modal de detalle completo ─────────────────────────────
function DetalleModal({
  m,
  onClose,
  onRefresh,
}: {
  m: ModeracionCompleta;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [acting, setActing] = useState(false);
  const [err, setErr]       = useState("");
  const pending = m.estado === "PENDIENTE";
  const tipo    = getTipo(m.resena);

  const resolver = async (estado: "APROBADA" | "RECHAZADA") => {
    if (estado === "RECHAZADA" && !motivo.trim()) { setErr("Ingresá un motivo para rechazar"); return; }
    setActing(true); setErr("");
    try {
      const res = await fetch("/api/moderacion/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idResena: m.idResena,
          estado: estado,
          motivo: motivo || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onRefresh();
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setActing(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Moderación #{m.id}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Reseña */}
          <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: 16, border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <TipoBadge tipo={tipo} />
              <Stars value={m.resena.calificacionGeneral} />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
              "{m.resena.descripcion}"
            </p>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Emisor</span>
                <span className="detail-value">
                  <EntityTooltipLabel
                    text={`#${shortenId(m.resena.idEmisor)}`}
                    entityType={tipo === "alquilador" ? "propietario" : "alquilador"}
                    entityId={m.resena.idEmisor}
                    showName
                  />
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Receptor</span>
                <span className="detail-value">
                  {(() => {
                    const receptor = getReceptorEntity(m.resena);
                    return receptor ? (
                      <EntityTooltipLabel
                        text={getReceptorLabel(m.resena)}
                        entityType={receptor.type}
                        entityId={receptor.id}
                        showName
                      />
                    ) : getReceptorLabel(m.resena);
                  })()}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Reserva</span>
                <span className="detail-value">#{m.resena.idReserva}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Fecha</span>
                <span className="detail-value">{new Date(m.resena.fechaCreacion).toLocaleDateString("es-AR")}</span>
              </div>
            </div>

            {m.resena.resenaVehiculo && (
              <div style={{ marginTop: 14, display: "flex", gap: 20 }}>
                {[["Limpieza",  m.resena.resenaVehiculo.calificacionLimpieza],
                  ["Estado",    m.resena.resenaVehiculo.calificacionEstado],
                  ["Comodidad", m.resena.resenaVehiculo.calificacionComodidad],
                ].map(([l, v]) => (
                  <div key={l as string} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{l}</div>
                    <Stars value={v as number} />
                  </div>
                ))}
              </div>
            )}
            {(m.resena.resenaPropietario || m.resena.resenaAlquilador) && (
              <div style={{ marginTop: 14, display: "flex", gap: 20 }}>
                {[
                  ["Comunicación", m.resena.resenaPropietario?.calificacionComunicacion ?? m.resena.resenaAlquilador?.calificacionComunicacion],
                  ["Puntualidad",  m.resena.resenaPropietario?.calificacionPuntualidad  ?? m.resena.resenaAlquilador?.calificacionPuntualidad],
                  ...(m.resena.resenaAlquilador ? [["Devolución", m.resena.resenaAlquilador.calificacionDevolucion]] : []),
                ].map(([l, v]) => (
                  <div key={l as string} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{l}</div>
                    <Stars value={v as number} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estado y motivo actual */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Estado:</span>
            <EstadoBadge estado={m.estado} />
            {m.motivo && <span style={{ fontSize: 12, color: "var(--danger)" }}>— {m.motivo}</span>}
          </div>

          {/* Respuesta del receptor */}
          {m.resena.respuesta && (
            <div style={{
              background: "var(--bg)", borderLeft: "3px solid var(--primary)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Respuesta del receptor</div>
              <p style={{ fontSize: 13 }}>{m.resena.respuesta.comentario}</p>
            </div>
          )}

          {/* Input de motivo solo si pendiente */}
          {pending && (
            <div className="form-group">
              <label className="form-label">Motivo de rechazo (requerido al rechazar)</label>
              <input
                className="form-input"
                value={motivo}
                onChange={e => { setMotivo(e.target.value); setErr(""); }}
                placeholder="Ej: Contenido inapropiado..."
              />
              {err && <span style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>{err}</span>}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          {pending && (
            <>
              <button className="btn btn-danger" onClick={() => resolver("RECHAZADA")} disabled={acting}>
                {acting ? "..." : <><X size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Rechazar</>}
              </button>
              <button className="btn btn-success" onClick={() => resolver("APROBADA")} disabled={acting}>
                {acting ? "..." : <><Check size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Aprobar</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────
export default function ModeracionPage() {
  const [moderaciones, setModeraciones] = useState<ModeracionCompleta[]>([]);
  const [loading, setLoading]           = useState(true);
  const [soloP, setSoloP]               = useState(true);
  const [selected, setSelected]         = useState<ModeracionCompleta | null>(null);
  const [alert, setAlert]               = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const filterLatestModeraciones = (items: ModeracionCompleta[]) => {
    const latestByResena = new Map<number, ModeracionCompleta>();
    for (const item of items) {
      const current = latestByResena.get(item.idResena);
      if (!current || new Date(item.fechaCreacion) > new Date(current.fechaCreacion)) {
        latestByResena.set(item.idResena, item);
      }
    }
    return Array.from(latestByResena.values());
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res  = await fetch(`/api/moderacion`);
    const data = await res.json();
    const latest = filterLatestModeraciones(data.moderaciones ?? []);
    setModeraciones(soloP ? latest.filter(m => m.estado === "PENDIENTE") : latest);
    setLoading(false);
  }, [soloP]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRefresh = () => {
    fetchData();
    setAlert({ type: "success", msg: "Moderación resuelta correctamente" });
    setTimeout(() => setAlert(null), 3000);
  };

  const pendientes = moderaciones.filter(m => m.estado === "PENDIENTE").length;
  const aprobadas  = moderaciones.filter(m => m.estado === "APROBADA").length;
  const rechazadas = moderaciones.filter(m => m.estado === "RECHAZADA").length;

  return (
    <div>
      <PageHeader
        title={<> <Shield size={32} style={{ verticalAlign: "text-bottom", marginRight: 8 }} /> Moderación de Reseñas</>}
        subtitle="Revisá y resolvé las solicitudes de moderación"
        action={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              className={`btn ${soloP ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setSoloP(p => !p)}
            >
              {soloP ? "Ver todas" : "Solo pendientes"}
            </button>
            <button className="btn btn-ghost" onClick={fetchData}><RefreshCcw size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Actualizar</button>
          </div>
        }
      />

      {alert && <div style={{ marginBottom: 18 }}><Alert type={alert.type} message={alert.msg} /></div>}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total",      val: moderaciones.length, color: "var(--text)"    },
          { label: "Pendientes", val: pendientes,          color: "var(--warning)" },
          { label: "Aprobadas",  val: aprobadas,           color: "var(--success)" },
          { label: "Rechazadas", val: rechazadas,          color: "var(--danger)"  },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <Loading /> : moderaciones.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><CheckCircle2 size={48} /></div>
          <div className="empty-state-text">No hay moderaciones {soloP ? "pendientes" : ""}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {moderaciones.map(m => (
            <ModeracionCard
              key={m.id}
              m={m}
              onRefresh={handleRefresh}
              onDetail={setSelected}
            />
          ))}
        </div>
      )}

      {selected && (
        <DetalleModal
          m={selected}
          onClose={() => setSelected(null)}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}