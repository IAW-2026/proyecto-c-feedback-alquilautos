"use client";

import { useState, useEffect } from "react";
import { Stars, EstadoBadge, TipoBadge } from "@/app/components/ui";
import {
  ResenaCompleta, ModeracionItem, RespuestaItem,
  EstadoMod, TipoResena, ModalMode,
  getTipo, fmtDate,
} from "@/lib/types";

// ── Sub-component: selector de calificación ───────────────
function CalifSelect({
  value, onChange, disabled,
}: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  if (disabled) return <Stars value={value} />;
  return (
    <select
      className="form-select"
      style={{ width: 70 }}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    >
      {[1, 2, 3, 4, 5].map(n => (
        <option key={n} value={n}>{n} ★</option>
      ))}
    </select>
  );
}

// ── Sub-component: sección de Respuesta ──────────────────
function RespuestaSection({
  respuesta, idResena, onRefresh, editable,
}: {
  respuesta: RespuestaItem | null;
  idResena: number;
  onRefresh: () => void;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [comentario, setComentario] = useState(respuesta?.comentario ?? "");
  const [idAutor, setIdAutor] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setComentario(respuesta?.comentario ?? "");
    setEditing(false);
    setAdding(false);
  }, [respuesta]);

  useEffect(() => {
    if (!editable) {
      setEditing(false);
      setAdding(false);
      setErr("");
    }
  }, [editable]);

  const save = async () => {
    setSaving(true); setErr("");
    try {
      if (adding) {
        const r = await fetch("/api/respuesta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idResena, idAutor: Number(idAutor), comentario }),
        });
        if (!r.ok) throw new Error((await r.json()).error);
        setAdding(false);
      } else {
        const r = await fetch(`/api/respuesta/${respuesta!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comentario }),
        });
        if (!r.ok) throw new Error((await r.json()).error);
        setEditing(false);
      }
      onRefresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const del = async () => {
    if (!confirm("¿Eliminar la respuesta?")) return;
    await fetch(`/api/respuesta/${respuesta!.id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
        Respuesta
      </div>

      {!respuesta && !adding ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Sin respuesta asociada.</span>
          {editable && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(true); setComentario(""); setIdAutor(""); }}>
              + Agregar respuesta
            </button>
          )}
        </div>
      ) : adding ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input className="form-input" type="number" placeholder="ID Autor" value={idAutor} onChange={e => setIdAutor(e.target.value)} />
          <textarea className="form-textarea" style={{ minHeight: 64 }} value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Comentario..." />
          {err && <span style={{ fontSize: 11, color: "var(--danger)" }}>{err}</span>}
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? "..." : "Guardar"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); setErr(""); }}>Cancelar</button>
          </div>
        </div>
      ) : editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Autor #{respuesta!.idAutor} · {fmtDate(respuesta!.fechaCreacion)}
          </div>
          <textarea className="form-textarea" style={{ minHeight: 64 }} value={comentario} onChange={e => setComentario(e.target.value)} />
          {err && <span style={{ fontSize: 11, color: "var(--danger)" }}>{err}</span>}
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? "..." : "Guardar"}</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setComentario(respuesta!.comentario); setErr(""); }}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px", border: "1px solid var(--border)", borderLeft: "3px solid var(--primary)" }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
            Autor #{respuesta!.idAutor} · {fmtDate(respuesta!.fechaCreacion)}
          </div>
          <p style={{ fontSize: 13, marginBottom: 10 }}>{respuesta!.comentario}</p>
          {editable && (<div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setComentario(respuesta!.comentario); }}>✏️ Editar</button>
            <button className="btn btn-danger btn-sm" onClick={del}>🗑️ Eliminar</button>
          </div>)}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: sección de Moderaciones ───────────────
function ModeracionesSection({
  moderaciones, idResena, onRefresh, editable,
}: {
  moderaciones: ModeracionItem[];
  idResena: number;
  onRefresh: () => void;
  editable: boolean;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ estado: EstadoMod; motivo: string }>({ estado: "Pendiente", motivo: "" });
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ idModerador: "", estado: "Pendiente" as EstadoMod, motivo: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!editable) {
      setEditingId(null);
      setAdding(false);
      setErr("");
    }
  }, [editable]);

  const startEdit = (m: ModeracionItem) => {
    setEditingId(m.id);
    setEditForm({ estado: m.estado, motivo: m.motivo ?? "" });
    setErr("");
  };

  const saveEdit = async () => {
    setSaving(true); setErr("");
    try {
      const r = await fetch(`/api/moderacion/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: editForm.estado, motivo: editForm.motivo || undefined }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setEditingId(null);
      onRefresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("¿Eliminar esta moderación?")) return;
    await fetch(`/api/moderacion/${id}`, { method: "DELETE" });
    onRefresh();
  };

  const saveNew = async () => {
    setSaving(true); setErr("");
    try {
      const r = await fetch("/api/moderacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idResena,
          idModerador: addForm.idModerador,
          estado: addForm.estado,
          motivo: addForm.motivo || undefined,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setAdding(false);
      setAddForm({ idModerador: "", estado: "Pendiente", motivo: "" });
      onRefresh();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Moderaciones ({moderaciones.length})
        </div>
        {editable && !adding && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(true); setErr(""); }}>+ Nueva</button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 260, overflowY: "auto" }}>
        {/* Form nueva moderacion */}
        {adding && (
          <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px", border: "1px dashed var(--border)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input className="form-input" type="number" placeholder="ID Moderador" style={{ flex: 1 }}
                value={addForm.idModerador} onChange={e => setAddForm(p => ({ ...p, idModerador: e.target.value }))} />
              <select className="form-select" style={{ flex: 1 }} value={addForm.estado}
                onChange={e => setAddForm(p => ({ ...p, estado: e.target.value as EstadoMod }))}>
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
              </select>
            </div>
            <input className="form-input" placeholder="Motivo (opcional)" style={{ marginBottom: 6 }}
              value={addForm.motivo} onChange={e => setAddForm(p => ({ ...p, motivo: e.target.value }))} />
            {err && <div style={{ fontSize: 11, color: "var(--danger)", marginBottom: 4 }}>{err}</div>}
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-primary btn-sm" onClick={saveNew} disabled={saving}>{saving ? "..." : "Crear"}</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); setErr(""); }}>Cancelar</button>
            </div>
          </div>
        )}

        {moderaciones.length === 0 && !adding && (
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>Sin moderaciones.</span>
        )}

        {moderaciones.map(m => (
          <div key={m.id} style={{
            background: "var(--bg)", borderRadius: "var(--radius-sm)",
            padding: "10px 12px", border: "1px solid var(--border)",
          }}>
            {editingId === m.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <select className="form-select" value={editForm.estado}
                  onChange={e => setEditForm(p => ({ ...p, estado: e.target.value as EstadoMod }))}>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="APROBADA">Aprobada</option>
                  <option value="RECHAZADA">Rechazada</option>
                </select>
                <input className="form-input" placeholder="Motivo"
                  value={editForm.motivo} onChange={e => setEditForm(p => ({ ...p, motivo: e.target.value }))} />
                {err && <div style={{ fontSize: 11, color: "var(--danger)" }}>{err}</div>}
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={saving}>{saving ? "..." : "Guardar"}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); setErr(""); }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <EstadoBadge estado={m.estado} />
                  {editable && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: "3px 7px" }} onClick={() => startEdit(m)}>✏️</button>
                      <button className="btn btn-danger btn-sm" style={{ padding: "3px 7px" }} onClick={() => del(m.id)}>🗑️</button>
                    </div>
                  )}
                </div>
                {m.motivo && <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 2 }}>{m.motivo}</div>}
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Mod. #{m.idModerador} · {fmtDate(m.fechaCreacion)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Formulario de creación ────────────────────────────────
const EMPTY_CREATE = {
  tipo: "vehiculo" as TipoResena,
  idReserva: "", idEmisor: "",
  calificacionGeneral: 5, descripcion: "",
  idVehiculo: "", calificacionLimpieza: 3, calificacionEstado: 3, calificacionComodidad: 3,
  idPropietario: "", calificacionComunicacion: 3, calificacionPuntualidad: 3,
  idAlquilador: "", calificacionDevolucion: 3,
};

// ── Componente principal ──────────────────────────────────
interface ResenaModalProps {
  resena: ResenaCompleta | null;
  initialMode: ModalMode;
  onClose: () => void;
  onSaved: () => void;
}

export default function ResenaModal({ resena: initialResena, initialMode, onClose, onSaved }: ResenaModalProps) {
  const [resena, setResena] = useState<ResenaCompleta | null>(initialResena);
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Form para edición de campos principales
  const [editForm, setEditForm] = useState(() => resena ? {
    calificacionGeneral: resena.calificacionGeneral,
    descripcion: resena.descripcion,
    calificacionLimpieza: resena.resenaVehiculo?.calificacionLimpieza ?? 3,
    calificacionEstado: resena.resenaVehiculo?.calificacionEstado ?? 3,
    calificacionComodidad: resena.resenaVehiculo?.calificacionComodidad ?? 3,
    calificacionComunicacion: resena.resenaPropietario?.calificacionComunicacion ?? resena.resenaAlquilador?.calificacionComunicacion ?? 3,
    calificacionPuntualidad: resena.resenaPropietario?.calificacionPuntualidad ?? resena.resenaAlquilador?.calificacionPuntualidad ?? 3,
    calificacionDevolucion: resena.resenaAlquilador?.calificacionDevolucion ?? 3,
  } : null);

  // Form para creación
  const [createForm, setCreateForm] = useState({ ...EMPTY_CREATE });
  const cf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setCreateForm(p => ({ ...p, [k]: e.target.value }));

  const tipo = resena ? getTipo(resena) : createForm.tipo;
  const isView = mode === "view";
  const isCreate = mode === "create";

  // Refetch resena después de cambios en respuesta/moderaciones
  const refresh = async () => {
    if (!resena) return;
    const r = await fetch(`/api/resena/${resena.id}`);
    const d = await r.json();
    if (d.resena) setResena(d.resena);
    onSaved();
  };

  // Guardar edición
  const saveEdit = async () => {
    if (!resena || !editForm) return;
    setSaving(true); setErr("");
    try {
      const body: Record<string, unknown> = {
        calificacionGeneral: editForm.calificacionGeneral,
        descripcion: editForm.descripcion,
      };
      if (tipo === "vehiculo") {
        body.calificacionLimpieza = editForm.calificacionLimpieza;
        body.calificacionEstado = editForm.calificacionEstado;
        body.calificacionComodidad = editForm.calificacionComodidad;
      } else if (tipo === "propietario") {
        body.calificacionComunicacion = editForm.calificacionComunicacion;
        body.calificacionPuntualidad = editForm.calificacionPuntualidad;
      } else {
        body.calificacionComunicacion = editForm.calificacionComunicacion;
        body.calificacionPuntualidad = editForm.calificacionPuntualidad;
        body.calificacionDevolucion = editForm.calificacionDevolucion;
      }
      const r = await fetch(`/api/resena/${resena.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      const d = await r.json();
      setResena(d.resena);
      setMode("view");
      onSaved();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  // Crear reseña
  const saveCreate = async () => {
    setSaving(true); setErr("");
    try {
      const base = {
        idReserva: Number(createForm.idReserva),
        idEmisor: createForm.idEmisor,
        calificacionGeneral: Number(createForm.calificacionGeneral),
        descripcion: createForm.descripcion,
      };
      let extra = {};
      if (createForm.tipo === "vehiculo") extra = { idVehiculo: Number(createForm.idVehiculo), calificacionLimpieza: Number(createForm.calificacionLimpieza), calificacionEstado: Number(createForm.calificacionEstado), calificacionComodidad: Number(createForm.calificacionComodidad) };
      else if (createForm.tipo === "propietario") extra = { idPropietario: Number(createForm.idPropietario), calificacionComunicacion: Number(createForm.calificacionComunicacion), calificacionPuntualidad: Number(createForm.calificacionPuntualidad) };
      else extra = { idAlquilador: Number(createForm.idAlquilador), calificacionComunicacion: Number(createForm.calificacionComunicacion), calificacionPuntualidad: Number(createForm.calificacionPuntualidad), calificacionDevolucion: Number(createForm.calificacionDevolucion) };

      const r = await fetch("/api/resena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base, ...extra }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      onSaved();
      onClose();
    } catch (e) { setErr((e as Error).message); }
    finally { setSaving(false); }
  };

  const title = isCreate ? "Nueva Reseña" : isView ? `Reseña #${resena?.id}` : `Editando Reseña #${resena?.id}`;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 880, width: "100%" }}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="modal-title">{title}</span>
            {!isCreate && resena && (
              <TipoBadge tipo={getTipo(resena)} />
            )}
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── CREATE FORM ─────────────────────────────── */}
          {isCreate && (
            <>
              <div className="form-group">
                <label className="form-label">Tipo de reseña</label>
                <select className="form-select" value={createForm.tipo} onChange={cf("tipo")}>
                  <option value="vehiculo">🚗 Vehículo</option>
                  <option value="propietario">👤 Propietario</option>
                  <option value="alquilador">🔑 Alquilador</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group"><label className="form-label">ID Reserva</label><input className="form-input" type="number" value={createForm.idReserva} onChange={cf("idReserva")} /></div>
                <div className="form-group"><label className="form-label">ID Emisor</label><input className="form-input" type="number" value={createForm.idEmisor} onChange={cf("idEmisor")} /></div>
                {createForm.tipo === "vehiculo" && <div className="form-group"><label className="form-label">ID Vehículo</label><input className="form-input" type="number" value={createForm.idVehiculo} onChange={cf("idVehiculo")} /></div>}
                {createForm.tipo === "propietario" && <div className="form-group"><label className="form-label">ID Propietario</label><input className="form-input" type="number" value={createForm.idPropietario} onChange={cf("idPropietario")} /></div>}
                {createForm.tipo === "alquilador" && <div className="form-group"><label className="form-label">ID Alquilador</label><input className="form-input" type="number" value={createForm.idAlquilador} onChange={cf("idAlquilador")} /></div>}
                <div className="form-group"><label className="form-label">Calificación general</label><CalifSelect value={Number(createForm.calificacionGeneral)} onChange={v => setCreateForm(p => ({ ...p, calificacionGeneral: v }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={createForm.descripcion} onChange={cf("descripcion")} /></div>
              {/* Sub-calificaciones */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {createForm.tipo === "vehiculo" && [["calificacionLimpieza", "Limpieza"], ["calificacionEstado", "Estado"], ["calificacionComodidad", "Comodidad"]].map(([k, l]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <CalifSelect value={Number((createForm as Record<string, unknown>)[k])} onChange={v => setCreateForm(p => ({ ...p, [k]: v }))} />
                  </div>
                ))}
                {(createForm.tipo === "propietario" || createForm.tipo === "alquilador") && [
                  ["calificacionComunicacion", "Comunicación"], ["calificacionPuntualidad", "Puntualidad"],
                  ...(createForm.tipo === "alquilador" ? [["calificacionDevolucion", "Devolución"]] : []),
                ].map(([k, l]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <CalifSelect value={Number((createForm as Record<string, unknown>)[k])} onChange={v => setCreateForm(p => ({ ...p, [k]: v }))} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── VIEW / EDIT FORM ─────────────────────────── */}
          {!isCreate && resena && editForm && (
            <>
              {/* Calificación general + descripción */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, alignItems: "start" }}>
                <div className="form-group">
                  <label className="form-label">Calificación general</label>
                  <CalifSelect
                    value={isView ? resena.calificacionGeneral : editForm.calificacionGeneral}
                    onChange={v => setEditForm(p => p ? { ...p, calificacionGeneral: v } : p)}
                    disabled={isView}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  {isView
                    ? <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{resena.descripcion}</p>
                    : <textarea className="form-textarea" value={editForm.descripcion} onChange={e => setEditForm(p => p ? { ...p, descripcion: e.target.value } : p)} />
                  }
                </div>
              </div>

              {/* Info readonly */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  ["Reserva", `#${resena.idReserva}`],
                  ["Emisor", `Usuario #${resena.idEmisor}`],
                  ["Receptor", resena.resenaVehiculo ? `Vehículo #${resena.resenaVehiculo.idVehiculo}` : resena.resenaPropietario ? `Propietario #${resena.resenaPropietario.idPropietario}` : `Alquilador #${resena.resenaAlquilador?.idAlquilador}`],
                  ["Fecha", fmtDate(resena.fechaCreacion)],
                ].map(([l, v]) => (
                  <div key={l} className="detail-item">
                    <span className="detail-label">{l}</span>
                    <span className="detail-value">{v}</span>
                  </div>
                ))}
              </div>

              {/* Sub-calificaciones */}
              {tipo === "vehiculo" && resena.resenaVehiculo && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Calificaciones del vehículo</div>
                  <div style={{ display: "flex", gap: 24 }}>
                    {[["Limpieza", "calificacionLimpieza"], ["Estado", "calificacionEstado"], ["Comodidad", "calificacionComodidad"]].map(([l, k]) => (
                      <div key={k} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{l}</div>
                        <CalifSelect
                          value={isView ? (resena.resenaVehiculo as Record<string, number>)[k] : Number((editForm as Record<string, unknown>)[k])}
                          onChange={v => setEditForm(p => p ? { ...p, [k]: v } : p)}
                          disabled={isView}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(tipo === "propietario" || tipo === "alquilador") && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
                    Calificaciones del {tipo}
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    {[
                      ["Comunicación", "calificacionComunicacion"],
                      ["Puntualidad", "calificacionPuntualidad"],
                      ...(tipo === "alquilador" ? [["Devolución", "calificacionDevolucion"]] : []),
                    ].map(([l, k]) => {
                      const srcView = tipo === "propietario"
                        ? (resena.resenaPropietario as Record<string, number>)?.[k]
                        : (resena.resenaAlquilador as Record<string, number>)?.[k];
                      return (
                        <div key={k} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{l}</div>
                          <CalifSelect
                            value={isView ? srcView : Number((editForm as Record<string, unknown>)[k])}
                            onChange={v => setEditForm(p => p ? { ...p, [k]: v } : p)}
                            disabled={isView}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Divider */}
              <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />

              {/* Respuesta + Moderaciones en dos columnas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <RespuestaSection
                  respuesta={resena.respuesta}
                  idResena={resena.id}
                  onRefresh={refresh}
                  editable={mode === "edit"}
                />
                <ModeracionesSection
                  moderaciones={resena.moderaciones}
                  idResena={resena.id}
                  onRefresh={refresh}
                  editable={mode === "edit"}
                />
              </div>
            </>
          )}

          {err && <div style={{ fontSize: 12, color: "var(--danger)" }}>{err}</div>}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {isCreate && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
              <button className="btn btn-primary" onClick={saveCreate} disabled={saving}>{saving ? "Creando..." : "Crear Reseña"}</button>
            </>
          )}
          {isView && resena && (
            <>
              <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => setMode("edit")}>✏️ Editar</button>
            </>
          )}
          {mode === "edit" && resena && (
            <>
              <button className="btn btn-ghost" onClick={() => { setMode("view"); setErr(""); }}>Cancelar edición</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}