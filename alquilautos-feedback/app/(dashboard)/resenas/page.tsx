"use client";

import { useState, useEffect, useCallback } from "react";
import { Stars, TipoBadge, EstadoBadge, Modal, Loading, PageHeader } from "@/app/components/ui";
import { ResenaCompleta as Resena } from "@/types";

function getTipo(r: Resena): "vehiculo" | "propietario" | "alquilador" {
  if (r.resenaVehiculo) return "vehiculo";
  if (r.resenaPropietario) return "propietario";
  return "alquilador";
}
function getReceptorId(r: Resena) {
  if (r.resenaVehiculo) return r.resenaVehiculo.idVehiculo;
  if (r.resenaPropietario) return r.resenaPropietario.idPropietario;
  if (r.resenaAlquilador) return r.resenaAlquilador.idAlquilador;
  return 0;
}
function getLastEstado(r: Resena) {
  return r.moderaciones[0]?.estado ?? "Sin moderación";
}

export default function ResenasPage() {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Resena | null>(null);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/resena");
    const data = await res.json();
    setResenas(data.resenas ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = resenas.filter(r => {
    const tipo = getTipo(r);
    if (filtroTipo !== "todos" && tipo !== filtroTipo) return false;
    const estado = getLastEstado(r).toLowerCase();
    if (filtroEstado !== "todos" && !estado.includes(filtroEstado.toLowerCase())) return false;
    if (busqueda && !r.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="⭐ Reseñas"
        subtitle={`${resenas.length} reseñas en total`}
        action={<button className="btn btn-ghost" onClick={fetchData}>↻ Actualizar</button>}
      />

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 20, padding: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          className="form-input"
          style={{ maxWidth: 240 }}
          placeholder="🔍 Buscar en descripción..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select className="form-select" style={{ maxWidth: 160 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          <option value="vehiculo">Vehículo</option>
          <option value="propietario">Propietario</option>
          <option value="alquilador">Alquilador</option>
        </select>
        <select className="form-select" style={{ maxWidth: 160 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        {(filtroTipo !== "todos" || filtroEstado !== "todos" || busqueda) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroTipo("todos"); setFiltroEstado("todos"); setBusqueda(""); }}>
            ✕ Limpiar filtros
          </button>
        )}
        <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: 12, color: "var(--text-muted)" }}>
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">No se encontraron reseñas</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Emisor</th>
                  <th>Receptor (ID)</th>
                  <th>Calificación</th>
                  <th>Descripción</th>
                  <th>Moderación</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>#{r.id}</td>
                    <td><TipoBadge tipo={getTipo(r)} /></td>
                    <td style={{ fontSize: 12 }}>#{r.idEmisor}</td>
                    <td style={{ fontSize: 12 }}>#{getReceptorId(r)}</td>
                    <td><Stars value={r.calificacionGeneral} /></td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", fontSize: 13 }}>
                        {r.descripcion}
                      </span>
                    </td>
                    <td><EstadoBadge estado={getLastEstado(r)} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {new Date(r.fechaCreacion).toLocaleDateString("es-AR")}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}>Detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <Modal
          title={`Reseña #${selected.id}`}
          onClose={() => setSelected(null)}
          footer={<button className="btn btn-ghost" onClick={() => setSelected(null)}>Cerrar</button>}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <TipoBadge tipo={getTipo(selected)} />
            <Stars value={selected.calificacionGeneral} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{selected.calificacionGeneral}/5</span>
          </div>

          <div className="card" style={{ background: "var(--bg)" }}>
            <p style={{ fontSize: 14 }}>{selected.descripcion}</p>
          </div>

          <div className="detail-grid">
            <div className="detail-item"><span className="detail-label">Reserva</span><span className="detail-value">#{selected.idReserva}</span></div>
            <div className="detail-item"><span className="detail-label">Emisor</span><span className="detail-value">Usuario #{selected.idEmisor}</span></div>
            <div className="detail-item">
              <span className="detail-label">Receptor</span>
              <span className="detail-value">
                {selected.resenaVehiculo ? `Vehículo #${selected.resenaVehiculo.idVehiculo}` :
                 selected.resenaPropietario ? `Propietario #${selected.resenaPropietario.idPropietario}` :
                 `Alquilador #${selected.resenaAlquilador?.idAlquilador}`}
              </span>
            </div>
            <div className="detail-item"><span className="detail-label">Fecha</span><span className="detail-value">{new Date(selected.fechaCreacion).toLocaleDateString("es-AR")}</span></div>
          </div>

          {/* Sub-calificaciones */}
          {selected.resenaVehiculo && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>CALIFICACIONES DETALLADAS</div>
              <div style={{ display: "flex", gap: 20 }}>
                {[["Limpieza", selected.resenaVehiculo.calificacionLimpieza], ["Estado", selected.resenaVehiculo.calificacionEstado], ["Comodidad", selected.resenaVehiculo.calificacionComodidad]].map(([l, v]) => (
                  <div key={l as string} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{l}</div>
                    <Stars value={v as number} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {(selected.resenaPropietario || selected.resenaAlquilador) && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>CALIFICACIONES DETALLADAS</div>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  ["Comunicación", selected.resenaPropietario?.calificacionComunicacion ?? selected.resenaAlquilador?.calificacionComunicacion],
                  ["Puntualidad", selected.resenaPropietario?.calificacionPuntualidad ?? selected.resenaAlquilador?.calificacionPuntualidad],
                  ...(selected.resenaAlquilador ? [["Devolución", selected.resenaAlquilador.calificacionDevolucion]] : []),
                ].map(([l, v]) => (
                  <div key={l as string} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{l}</div>
                    <Stars value={v as number} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderaciones */}
          {selected.moderaciones.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>HISTORIAL DE MODERACIÓN</div>
              {selected.moderaciones.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <EstadoBadge estado={m.estado} />
                  {m.motivo && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.motivo}</span>}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{new Date(m.fechaCreacion).toLocaleDateString("es-AR")}</span>
                </div>
              ))}
            </div>
          )}

          {/* Respuesta */}
          {selected.respuesta && (
            <div className="card" style={{ background: "var(--bg)", borderLeft: "3px solid var(--primary)" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                Respuesta del receptor (Usuario #{selected.respuesta.idAutor})
              </div>
              <p style={{ fontSize: 13 }}>{selected.respuesta.comentario}</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
