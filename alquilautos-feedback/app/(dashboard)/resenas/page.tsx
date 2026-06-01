"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Stars, TipoBadge, EstadoBadge, Loading, PageHeader, Truncated, EntityTooltipLabel, ConfirmModal } from "@/app/components/ui";
import ResenaModal from "@/app/components/modal/ResenaModal";
import { HistorialModeraciones, HistorialRespuestas } from "@/app/components/modal/HistorialModal";
import {
  ResenaCompleta, ModalMode,
  getTipo, getReceptorId, getLastEstado, fmtDate,
  shortenId,
} from "@/lib/types";

// ── Estado del modal ──────────────────────────────────────
interface ModalState {
  open: boolean;
  resena: ResenaCompleta | null;
  mode: ModalMode;
}

const MODAL_CLOSED: ModalState = { open: false, resena: null, mode: ModalMode.VIEW };

function ResenasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [resenas, setResenas] = useState<ResenaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResena, setLoadingResena] = useState(false);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState(searchParams.get("tipo") ?? "todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroReceptorId, setFiltroReceptorId] = useState(searchParams.get("receptorId") ?? "");

  // Modales
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);
  const [historialMod, setHistorialMod] = useState(false);
  const [historialResp, setHistorialResp] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ResenaCompleta | null>(null);

  // ── Fetch lista ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/resena", { cache: "no-store" });
    const d = await r.json();
    setResenas(d.resenas ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Abrir reseña por ID (para historial) ────────────────
  const openResenaById = async (id: number, mode: ModalMode = ModalMode.VIEW) => {
    setLoadingResena(true);
    const r = await fetch(`/api/resena/${id}`);
    const d = await r.json();
    setLoadingResena(false);
    if (d.resena) setModal({ open: true, resena: d.resena, mode });
  };

  // ── Eliminar ────────────────────────────────────────────
  const handleDelete = async (r: ResenaCompleta, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(r);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    await fetch(`/api/resena/${confirmDelete.id}`, { method: "DELETE" });
    fetchData();
  };

  const clearFiltroReceptor = () => {
    setFiltroReceptorId("");
    setFiltroTipo("todos");
    router.replace("/resenas");
  };

  // ── Filtrado ────────────────────────────────────────────
  const filtered = resenas.filter(r => {
    if (filtroTipo !== "todos" && getTipo(r) !== filtroTipo) return false;
    const estado = getLastEstado(r).toLowerCase();
    if (filtroEstado !== "todos" && !estado.startsWith(filtroEstado.toLowerCase())) return false;
    if (busqueda && !r.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false;
    if (filtroDesde && new Date(r.fechaCreacion) < new Date(filtroDesde)) return false;
    if (filtroHasta && new Date(r.fechaCreacion) > new Date(filtroHasta + "T23:59:59")) return false;
    if (filtroReceptorId && String(getReceptorId(r)) !== filtroReceptorId) return false;
    return true;
  });

  const hayFiltros = filtroTipo !== "todos" || filtroEstado !== "todos" || busqueda || filtroDesde || filtroHasta  || filtroReceptorId;

  return (
    <div>
      <PageHeader
        title="⭐ Reseñas"
        subtitle={`${resenas.length} reseñas en total`}
        action={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button className="btn btn-ghost" onClick={fetchData} title="Refrescar lista">↻ Actualizar</button>
            <button className="btn btn-ghost" onClick={() => setHistorialMod(true)}>🛡️ Historial moder.</button>
            <button className="btn btn-ghost" onClick={() => setHistorialResp(true)}>💬 Historial resp.</button>
            <button className="btn btn-primary" onClick={() => setModal({ open: true, resena: null, mode: ModalMode.CREATE })}>
              + Nueva reseña
            </button>
          </div>
        }
      />

      {/* ── Filtro de receptor activo (viene de /entidades) ── */}
      {filtroReceptorId && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
          background: "var(--primary-light)", border: "1px solid var(--primary)",
          borderRadius: "var(--radius-sm)", padding: "8px 14px",
        }}>
          <span style={{ fontSize: 13, color: "var(--primary)" }}>
            🔗 Mostrando reseñas de{" "}
            <strong>
              {filtroTipo !== "todos" ? filtroTipo : "entidad"} #{filtroReceptorId}
            </strong>
          </span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: "auto", color: "var(--primary)" }}
            onClick={clearFiltroReceptor}
          >
            ✕ Quitar filtro
          </button>
        </div>
      )}

      {/* ── Filtros ───────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 18, padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input className="form-input" style={{ minWidth: 180, flex: 1 }}
            placeholder="🔍 Buscar descripción..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />

          <select className="form-select" style={{ maxWidth: 150 }} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="vehiculo">🚗 Vehículo</option>
            <option value="propietario">👤 Propietario</option>
            <option value="alquilador">🔑 Alquilador</option>
          </select>

          <select className="form-select" style={{ maxWidth: 150 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobada">Aprobada</option>
            <option value="rechazada">Rechazada</option>
            <option value="sin">Sin moderar</option>
          </select>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Desde</span>
            <input type="date" className="form-input" style={{ maxWidth: 140 }} value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Hasta</span>
            <input type="date" className="form-input" style={{ maxWidth: 140 }} value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} />
          </div>

          {hayFiltros && (
            <button className="btn btn-ghost btn-sm" onClick={() => {
              setBusqueda(""); setFiltroTipo("todos"); setFiltroEstado("todos");
              setFiltroDesde(""); setFiltroHasta(""); clearFiltroReceptor();
            }}>
              ✕ Limpiar
            </button>
          )}

          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Tabla ─────────────────────────────────────────── */}
      {loading || loadingResena ? <Loading /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-text">{hayFiltros ? "Sin reseñas para los filtros aplicados" : "No hay reseñas registradas"}</div>
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
                  <th>Receptor</th>
                  <th>Calif.</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{r.id}</td>
                    <td><TipoBadge tipo={getTipo(r)} /></td>
                    <td style={{ fontSize: 12 }}>
                      <EntityTooltipLabel
                        text={`#${shortenId(r.idEmisor)}`}
                        entityType={getTipo(r) === "alquilador" ? "propietario" : "alquilador"}
                        entityId={r.idEmisor}
                      />
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <EntityTooltipLabel
                        text={`#${shortenId(getReceptorId(r))}`}
                        entityType={r.resenaVehiculo ? "vehiculo" : r.resenaPropietario ? "propietario" : "alquilador"}
                        entityId={getReceptorId(r)}
                      />
                    </td>
                    <td><Stars value={r.calificacionGeneral} /></td>
                    <td style={{ maxWidth: 220 }}>
                      <Truncated text={r.descripcion} maxW={220} />
                    </td>
                    <td><EstadoBadge estado={getLastEstado(r)} /></td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {fmtDate(r.fechaCreacion)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Ver detalle"
                          onClick={() => setModal({ open: true, resena: r, mode: ModalMode.VIEW })}
                        >
                          👁️
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="Editar"
                          onClick={() => setModal({ open: true, resena: r, mode: ModalMode.EDIT })}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          title="Eliminar"
                          onClick={e => handleDelete(r, e)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modales ───────────────────────────────────────── */}
      {modal.open && (
        <ResenaModal
          resena={modal.resena}
          initialMode={modal.mode}
          onClose={() => setModal(MODAL_CLOSED)}
          onSaved={fetchData}
        />
      )}

      {historialMod && (
        <HistorialModeraciones
          onClose={() => setHistorialMod(false)}
          onOpenResena={id => {
            setHistorialMod(false);
            openResenaById(id, ModalMode.VIEW);
          }}
        />
      )}

      {historialResp && (
        <HistorialRespuestas
          onClose={() => setHistorialResp(false)}
          onOpenResena={id => {
            setHistorialResp(false);
            openResenaById(id, ModalMode.VIEW);
          }}
        />
      )}

    <ConfirmModal
      isOpen={confirmDelete !== null}
      title="Eliminar reseña"
      message={`¿Estás seguro de que deseas eliminar la reseña #${confirmDelete?.id}? Esta acción no se puede deshacer.`}
      onConfirm={executeDelete}
      onClose={() => setConfirmDelete(null)}
    />
    </div>
  );
}

// ── Page con Suspense requerido por useSearchParams ───────
export default function ResenasPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResenasContent />
    </Suspense>
  );
}