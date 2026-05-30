"use client";

import { useState, useEffect, useCallback } from "react";
import { Stars, TipoBadge, EstadoBadge, Modal, Loading, Alert } from "@/app/components/ui";
import { ResenaCompleta as Resena } from "@/lib/types";

const EMPTY_FORM = {
  tipo: "vehiculo",
  id_reserva: "", id_emisor: "", calificacion_general: "5", descripcion: "",
  id_vehiculo: "", calificacion_limpieza: "3", calificacion_estado: "3", calificacion_comodidad: "3",
  id_propietario: "", calificacion_comunicacion: "3", calificacion_puntualidad: "3",
  id_alquilador: "", calificacion_devolucion: "3",
};

export default function DebugResenas() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Resena | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [acting, setActing] = useState(false);

  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetch_ = useCallback(async () => {
    setLoading(true);
    let r = await fetch("/api/resena", {cache:"no-store"});

    if (!r.ok) {
      console.warn("Primer fetch falló, reintentando...");
      await new Promise(res => setTimeout(res, 300));
      r = await fetch("/api/resena");
    }
    if (!r.ok)
      throw new Error("No se pudo obtener la API");

    const d = await r.json();
    setResenas(d.resenas ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const buildPayload = () => {
    const base = {
      idReserva: Number(form.id_reserva),
      idEmisor: form.id_emisor,
      calificacionGeneral: Number(form.calificacion_general),
      descripcion: form.descripcion,
    };
    if (form.tipo === "vehiculo") return { ...base, idVehiculo: Number(form.id_vehiculo), calificacionLimpieza: Number(form.calificacion_limpieza), calificacionEstado: Number(form.calificacion_estado), calificacionComodidad: Number(form.calificacion_comodidad) };
    if (form.tipo === "propietario") return { ...base, idPropietario: Number(form.id_propietario), calificacionComunicacion: Number(form.calificacion_comunicacion), calificacionPuntualidad: Number(form.calificacion_puntualidad) };
    return { ...base, idAlquilador: Number(form.id_alquilador), calificacionComunicacion: Number(form.calificacion_comunicacion), calificacionPuntualidad: Number(form.calificacion_puntualidad), calificacionDevolucion: Number(form.calificacion_devolucion) };
  };

  const handleCreate = async () => {
    setActing(true);
    try {
      const res = await fetch("/api/resena", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildPayload()) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showAlert("success", "Reseña creada correctamente");
      setShowCreate(false);
      setForm({ ...EMPTY_FORM });
      fetch_();
    } catch (e) { showAlert("error", (e as Error).message); }
    finally { setActing(false); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setActing(true);
    try {
      const res = await fetch(`/api/resena/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calificacion_general: Number(form.calificacion_general), descripcion: form.descripcion }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showAlert("success", "Reseña actualizada");
      setEditTarget(null);
      fetch_();
    } catch (e) { showAlert("error", (e as Error).message); }
    finally { setActing(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`¿Eliminar reseña #${id}?`)) return;
    const res = await fetch(`/api/resena/${id}`, { method: "DELETE" });
    if (res.ok) { showAlert("success", "Reseña eliminada"); fetch_(); }
    else showAlert("error", "Error al eliminar");
  };

  const openEdit = (r: Resena) => {
    setForm({ ...EMPTY_FORM, calificacion_general: String(r.calificacionGeneral), descripcion: r.descripcion });
    setEditTarget(r);
  };

  const getTipo = (r: Resena) => r.resenaVehiculo ? "vehiculo" : r.resenaPropietario ? "propietario" : "alquilador";

  return (
    <div>
      {alert && <div style={{ marginBottom: 14 }}><Alert type={alert.type} message={alert.msg} /></div>}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{resenas.length} reseñas</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowCreate(true); setForm({ ...EMPTY_FORM }); }}>
          + Nueva Reseña
        </button>
      </div>

      {loading ? <Loading /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Tipo</th><th>Emisor</th><th>Reserva</th><th>Calif.</th><th>Descripción</th><th>Moder.</th><th>Acciones</th></tr></thead>
              <tbody>
                {resenas.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{r.id}</td>
                    <td><TipoBadge tipo={getTipo(r)} /></td>
                    <td style={{ fontSize: 12 }}>#{r.idEmisor}</td>
                    <td style={{ fontSize: 12 }}>#{r.idReserva}</td>
                    <td><Stars value={r.calificacionGeneral} /></td>
                    <td style={{ maxWidth: 180 }}><span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{r.descripcion}</span></td>
                    <td>{r.moderaciones[0] ? <EstadoBadge estado={r.moderaciones[0].estado} /> : <span style={{ color: "var(--text-muted)", fontSize: 11 }}>—</span>}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Nueva Reseña" onClose={() => setShowCreate(false)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={acting}>{acting ? "Creando..." : "Crear"}</button>
          </>
        }>
          <div className="form-group">
            <label className="form-label">Tipo de reseña</label>
            <select className="form-select" value={form.tipo} onChange={f("tipo")}>
              <option value="vehiculo">Vehículo</option>
              <option value="propietario">Propietario</option>
              <option value="alquilador">Alquilador</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group"><label className="form-label">ID Reserva</label><input className="form-input" type="number" value={form.id_reserva} onChange={f("id_reserva")} /></div>
            <div className="form-group"><label className="form-label">ID Emisor</label><input className="form-input" type="number" value={form.id_emisor} onChange={f("id_emisor")} /></div>
            {form.tipo === "vehiculo" && <div className="form-group"><label className="form-label">ID Vehículo</label><input className="form-input" type="number" value={form.id_vehiculo} onChange={f("id_vehiculo")} /></div>}
            {form.tipo === "propietario" && <div className="form-group"><label className="form-label">ID Propietario</label><input className="form-input" type="number" value={form.id_propietario} onChange={f("id_propietario")} /></div>}
            {form.tipo === "alquilador" && <div className="form-group"><label className="form-label">ID Alquilador</label><input className="form-input" type="number" value={form.id_alquilador} onChange={f("id_alquilador")} /></div>}
            <div className="form-group"><label className="form-label">Calificación General (1-5)</label><input className="form-input" type="number" min={1} max={5} value={form.calificacion_general} onChange={f("calificacion_general")} /></div>
          </div>
          <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.descripcion} onChange={f("descripcion")} /></div>
          {/* Sub-calificaciones */}
          {form.tipo === "vehiculo" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["calificacion_limpieza","Limpieza"],["calificacion_estado","Estado"],["calificacion_comodidad","Comodidad"]].map(([k,l]) => (
                <div key={k} className="form-group"><label className="form-label">{l}</label><input className="form-input" type="number" min={1} max={5} value={(form as Record<string,string>)[k]} onChange={f(k)} /></div>
              ))}
            </div>
          )}
          {(form.tipo === "propietario" || form.tipo === "alquilador") && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["calificacion_comunicacion","Comunicación"],["calificacion_puntualidad","Puntualidad"],...(form.tipo==="alquilador"?[["calificacion_devolucion","Devolución"]]:[])]
                .map(([k,l]) => (
                  <div key={k} className="form-group"><label className="form-label">{l}</label><input className="form-input" type="number" min={1} max={5} value={(form as Record<string,string>)[k]} onChange={f(k)} /></div>
                ))}
            </div>
          )}
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal title={`Editar Reseña #${editTarget.id}`} onClose={() => setEditTarget(null)} footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleEdit} disabled={acting}>{acting ? "Guardando..." : "Guardar"}</button>
          </>
        }>
          <div className="form-group"><label className="form-label">Calificación General (1-5)</label><input className="form-input" type="number" min={1} max={5} value={form.calificacion_general} onChange={f("calificacion_general")} /></div>
          <div className="form-group"><label className="form-label">Descripción</label><textarea className="form-textarea" value={form.descripcion} onChange={f("descripcion")} /></div>
        </Modal>
      )}
    </div>
  );
}
