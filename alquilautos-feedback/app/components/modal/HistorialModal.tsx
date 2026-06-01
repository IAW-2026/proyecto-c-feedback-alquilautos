"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Search, ShieldCheck, MessageSquare } from "lucide-react";
import { EstadoBadge, Loading } from "@/app/components/ui";
import { ModeracionCompleta, RespuestaCompleta, fmtDate } from "@/lib/types";

// ── Historial de Moderaciones ─────────────────────────────
export function HistorialModeraciones({
  onClose,
  onOpenResena,
}: {
  onClose: () => void;
  onOpenResena: (id: number) => void;
}) {
  const [items, setItems] = useState<ModeracionCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/moderacion");
    const d = await r.json();
    setItems(d.moderaciones ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(m => {
    if (filtroEstado !== "todos" && m.estado.toLowerCase() !== filtroEstado) return false;
    if (busqueda && !m.resena.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 820, width: "100%" }}>
        <div className="modal-header">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={24} color="var(--primary)" />
            <span className="modal-title">Historial de Moderaciones ({items.length})</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 auto", maxWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input" style={{ paddingLeft: 30, maxWidth: "100%" }} placeholder="Buscar en reseña..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <select className="form-select" style={{ maxWidth: 160 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <span style={{ alignSelf: "center", fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><AlertTriangle size={32} /></div><div className="empty-state-text">Sin resultados</div></div>
        ) : (
          <div className="table-wrap" style={{ maxHeight: "55vh", overflowY: "auto" }}>
            <table>
              <thead>
                <tr><th>ID</th><th>Reseña</th><th>Moderador</th><th>Estado</th><th>Motivo</th><th>Fecha</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{m.id}</td>
                    <td style={{ fontSize: 12, maxWidth: 180 }}>
                      <div style={{ fontWeight: 500 }}>Reseña #{m.idResena}</div>
                      <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.resena.descripcion}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>#{m.idModerador}</td>
                    <td><EstadoBadge estado={m.estado} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 140 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.motivo ?? "—"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(m.fechaCreacion)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { onClose(); onOpenResena(m.idResena); }}>
                        Ver reseña
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Historial de Respuestas ───────────────────────────────
export function HistorialRespuestas({
  onClose,
  onOpenResena,
}: {
  onClose: () => void;
  onOpenResena: (id: number) => void;
}) {
  const [items, setItems] = useState<RespuestaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/respuesta");
    const d = await r.json();
    setItems(d.respuestas ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(r =>
    !busqueda ||
    r.comentario.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.resena.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 700, width: "100%" }}>
        <div className="modal-header">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={24} color="var(--primary)" />
            <span className="modal-title">Historial de Respuestas ({items.length})</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ position: "relative", flex: "1 1 auto", maxWidth: 260 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="form-input" style={{ paddingLeft: 30, maxWidth: "100%" }} placeholder="Buscar en comentario o reseña..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          </div>
          <span style={{ alignSelf: "center", fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? <Loading /> : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><MessageSquare size={32} /></div><div className="empty-state-text">Sin resultados</div></div>
        ) : (
          <div className="table-wrap" style={{ maxHeight: "55vh", overflowY: "auto" }}>
            <table>
              <thead>
                <tr><th>ID</th><th>Reseña</th><th>Autor</th><th>Comentario</th><th>Fecha</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{r.id}</td>
                    <td style={{ fontSize: 12, maxWidth: 160 }}>
                      <div style={{ fontWeight: 500 }}>Reseña #{r.idResena}</div>
                      <div style={{ color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.resena.descripcion}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>#{r.idAutor}</td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>
                        {r.comentario}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(r.fechaCreacion)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => { onClose(); onOpenResena(r.idResena); }}>
                        Ver reseña
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}