"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Loading, Alert } from "@/app/components/ui";

interface Respuesta {
  id_respuesta: number;
  id_resena: number;
  id_autor: number;
  comentario: string;
  fecha_creacion: string;
  resena: { id_resena: number; descripcion: string };
}

const EMPTY_FORM = { id_resena: "", id_autor: "", comentario: "" };

export default function DebugRespuestas() {
  const [items, setItems] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Respuesta | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editComentario, setEditComentario] = useState("");
  const [acting, setActing] = useState(false);

  const showAlert = (type: "success" | "error", msg: string) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/respuesta");
    const d = await r.json();
    setItems(d.respuestas ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleCreate = async () => {
    setActing(true);
    try {
      const res = await fetch("/api/respuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena: Number(form.id_resena),
          id_autor: Number(form.id_autor),
          comentario: form.comentario,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showAlert("success", "Respuesta creada correctamente");
      setShowCreate(false);
      setForm({ ...EMPTY_FORM });
      fetchData();
    } catch (e) { showAlert("error", (e as Error).message); }
    finally { setActing(false); }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setActing(true);
    try {
      const res = await fetch(`/api/respuesta/${editTarget.id_respuesta}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comentario: editComentario }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      showAlert("success", "Respuesta actualizada");
      setEditTarget(null);
      fetchData();
    } catch (e) { showAlert("error", (e as Error).message); }
    finally { setActing(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`¿Eliminar respuesta #${id}?`)) return;
    const res = await fetch(`/api/respuesta/${id}`, { method: "DELETE" });
    if (res.ok) { showAlert("success", "Respuesta eliminada"); fetchData(); }
    else showAlert("error", "Error al eliminar");
  };

  return (
    <div>
      {alert && <div style={{ marginBottom: 14 }}><Alert type={alert.type} message={alert.msg} /></div>}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{items.length} respuestas</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowCreate(true); setForm({ ...EMPTY_FORM }); }}>
          + Nueva Respuesta
        </button>
      </div>

      {loading ? <Loading /> : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-text">No hay respuestas registradas</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Reseña</th>
                  <th>Autor</th>
                  <th>Comentario</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr key={r.id_respuesta}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{r.id_respuesta}</td>
                    <td style={{ fontSize: 12 }}>
                      <div>Reseña #{r.id_resena}</div>
                      <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                        {r.resena.descripcion}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>Usuario #{r.id_autor}</td>
                    <td style={{ fontSize: 13, maxWidth: 240 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.comentario}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(r.fecha_creacion).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditTarget(r); setEditComentario(r.comentario); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id_respuesta)}>🗑️</button>
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
          title="Nueva Respuesta"
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
              <label className="form-label">ID Autor</label>
              <input className="form-input" type="number" value={form.id_autor} onChange={f("id_autor")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Comentario</label>
            <textarea className="form-textarea" value={form.comentario} onChange={f("comentario")} placeholder="Texto de la respuesta..." />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg)", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
            ℹ️ Solo se puede crear una respuesta por reseña.
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal
          title={`Editar Respuesta #${editTarget.id_respuesta}`}
          onClose={() => setEditTarget(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setEditTarget(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleEdit} disabled={acting}>
                {acting ? "Guardando..." : "Guardar"}
              </button>
            </>
          }
        >
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
            Reseña #{editTarget.id_resena} · Autor #{editTarget.id_autor}
          </div>
          <div className="form-group">
            <label className="form-label">Comentario</label>
            <textarea
              className="form-textarea"
              value={editComentario}
              onChange={e => setEditComentario(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
