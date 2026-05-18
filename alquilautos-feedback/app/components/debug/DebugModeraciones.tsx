"use client";

import { useState, useEffect, useCallback } from "react";
import { EstadoBadge, Modal, Loading, Alert } from "@/app/components/ui";

interface Moderacion {
  id_moderacion: number;
  id_resena: number;
  id_moderador: number;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  motivo: string | null;
  fecha_creacion: string;
  resena: { id_resena: number; descripcion: string; calificacion_general: number };
}

const EMPTY_FORM = { id_resena: "", id_moderador: "", estado: "Pendiente", motivo: "" };

export default function DebugModeraciones() {
  const [items, setItems] = useState<Moderacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Moderacion | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [acting, setActing] = useState(false);

  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/moderacion");
    const d = await r.json();
    setItems(d.moderaciones ?? []);
    console.log(items);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    setActing(true);
    try {
      const res = await fetch("/api/moderacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena: Number(form.id_resena),
          id_moderador: Number(form.id_moderador),
          estado: form.estado,
          motivo: form.motivo || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showAlert("success", "Moderación creada correctamente");
      setShowCreate(false);
      setForm({ ...EMPTY_FORM });
      fetchData();
    } catch (e) { showAlert("error", (e as Error).message); }
    finally { setActing(false); }
  };

  const handlePatch = async () => {
    if (!editTarget) return;
    setActing(true);
    try {
      const res = await fetch(`/api/moderacion/${editTarget.id_moderacion}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: form.estado, motivo: form.motivo || undefined }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showAlert("success", "Moderación actualizada");
      setEditTarget(null);
      fetchData();
    } catch (e) { showAlert("error", (e as Error).message); }
    finally { setActing(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`¿Eliminar moderación #${id}?`)) return;
    const res = await fetch(`/api/moderacion/${id}`, { method: "DELETE" });
    if (res.ok) { showAlert("success", "Moderación eliminada"); fetchData(); }
    else showAlert("error", "Error al eliminar");
  };

  const openEdit = (m: Moderacion) => {
    setForm({ id_resena: String(m.id_resena), id_moderador: String(m.id_moderador), estado: m.estado, motivo: m.motivo ?? "" });
    setEditTarget(m);
  };

  return (
    <div>
      {alert && <div style={{ marginBottom: 14 }}><Alert type={alert.type} message={alert.msg} /></div>}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{items.length} moderaciones</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowCreate(true); setForm({ ...EMPTY_FORM }); }}>
          + Nueva Moderación
        </button>
      </div>

      {loading ? <Loading /> : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reseña</th>
                  <th>Moderador</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(m => (
                  <tr key={m.id_moderacion}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{m.id_moderacion}</td>
                    <td style={{ fontSize: 12 }}>
                      <div>Reseña #{m.id_resena}</div>
                      <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
                        {m.resena.descripcion}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>#{m.id_moderador}</td>
                    <td><EstadoBadge estado={m.estado} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 140 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.motivo ?? "—"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(m.fecha_creacion).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id_moderacion)}>🗑️</button>
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
        <Modal
          title="Nueva Moderación"
          onClose={() => setShowCreate(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={acting}>
                {acting ? "Creando..." : "Crear"}
              </button>
            </>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">ID Reseña</label>
              <input className="form-input" type="number" value={form.id_resena} onChange={f("id_resena")} />
            </div>
            <div className="form-group">
              <label className="form-label">ID Moderador</label>
              <input className="form-input" type="number" value={form.id_moderador} onChange={f("id_moderador")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.estado} onChange={f("estado")}>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Motivo (opcional / requerido si Rechazada)</label>
            <input className="form-input" value={form.motivo} onChange={f("motivo")} placeholder="Ej: Contenido inapropiado" />
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal
          title={`Editar Moderación #${editTarget.id_moderacion}`}
          onClose={() => setEditTarget(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handlePatch} disabled={acting}>
                {acting ? "Guardando..." : "Guardar"}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.estado} onChange={f("estado")}>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Motivo</label>
            <input className="form-input" value={form.motivo} onChange={f("motivo")} placeholder="Requerido si estado es Rechazada" />
          </div>
        </Modal>
      )}
    </div>
  );
}
