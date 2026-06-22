"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loading, PageHeader } from "@/app/components/ui";
import { Car, FileText, Key, Bot, Star, User, Folder } from "lucide-react";
import { TipoResena } from "@/lib/types";

interface Vehiculo {
  idVehiculo: number;
  idPropietario: number;
  marca: string;
  modelo: string;
  precio: number;
}

interface Alquilador {
  idAlquilador: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  licenciaConducir: string;
  direccion: string;
}

interface Propietario {
  idPropietario: string;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  direccion: string;
}

type Tab = "vehiculos" | "alquiladores" | "propietarios";

interface PromedioResult {
  calificacion_promedio: number;
  cantidad_resenas: number;
}

// ── Modal de resumen IA ───────────────────────────────────
function ResumenModal({
  entidad,
  resumen,
  onClose,
}: {
  entidad: string;
  resumen: string;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title"><Bot size={24} style={{ verticalAlign: "text-bottom", marginRight: 8 }} /> Resumen IA — {entidad}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
 
        <div style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", padding: "16px",
          fontSize: 14, lineHeight: 1.7, color: "var(--text)",
        }}>
          {resumen}
        </div>
 
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 10, textAlign: "right" }}>
          Generado por Gemini 3.1 Flash Lite (Google)
        </div>
 
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ── Botón de promedio (inline) ────────────────────────────
function PromedioBtn({ tipo, id }: { tipo: TipoResena; id: number | string }) {
  const [state, setState] = useState<"idle" | "loading" | PromedioResult>("idle");
 
  const fetch_ = async () => {
    setState("loading");
    const r = await fetch(`/api/promedio/${tipo}/${id}`);
    const d = await r.json();
    setState({
      calificacion_promedio: d.calificacion_promedio ?? 0,
      cantidad_resenas: d.cantidad_resenas ?? 0,
    });
  };
 
  if (state === "idle") {
    return <button className="btn btn-ghost btn-sm" onClick={fetch_}><Star size={14} strokeWidth={2.5} style={{ verticalAlign: "middle", marginRight: 6 }} /> Promedio</button>;
  }
  if (state === "loading") {
    return <button className="btn btn-ghost btn-sm" disabled>Cargando...</button>;
  }
 
  const { calificacion_promedio, cantidad_resenas } = state as PromedioResult;
  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={fetch_}
      title="Clic para actualizar"
      style={{ color: cantidad_resenas === 0 ? "var(--text-muted)" : "var(--warning)" }}
    >
      {cantidad_resenas === 0
        ? "Sin reseñas"
        : <><Star size={14} strokeWidth={2.5} style={{ verticalAlign: "middle", marginRight: 6 }} /> {calificacion_promedio.toFixed(1)} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({cantidad_resenas})</span></>
      }
    </button>
  );
}

// ── Botón de resumen IA ───────────────────────────────────
function ResumenBtn({ tipo, id, label }: { tipo: TipoResena; id: number | string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState<string | null>(null);
  const [err, setErr] = useState("");
 
  const fetch_ = async () => {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`/api/resumen/${tipo}/${id}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResumen(d.resumen);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={fetch_} disabled={loading}>
        {loading ? "Generando..." : <><Bot size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Resumen IA</>}
      </button>
      {err && (
        <span style={{ fontSize: 11, color: "var(--danger)", display: "block", marginTop: 2 }}>
          {err}
        </span>
      )}
      {resumen !== null && (
        <ResumenModal
          entidad={label}
          resumen={resumen}
          onClose={() => setResumen(null)}
        />
      )}
    </>
  );
}

// ── Tab: Vehículos ────────────────────────────────────────
function TabVehiculos() {
  const router = useRouter();
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/proxy/seller/api/vehiculo/disponible');
    const d = await r.json();
    setItems(d.data.vehiculos ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return <Loading />;

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Marca / Modelo</th><th>Propietario</th>
              <th>Precio/día</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(v => (
              <tr key={v.idVehiculo}>
                <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{v.idVehiculo}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{v.marca}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{v.modelo}</div>
                </td>
                <td style={{ fontSize: 12 }}>#{v.idPropietario}</td>
                <td style={{ fontSize: 13 }}>${v.precio.toLocaleString("es-AR")}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <PromedioBtn tipo="vehiculo" id={v.idVehiculo} />
                    <ResumenBtn tipo="vehiculo" id={v.idVehiculo} label={`${v.marca} ${v.modelo} #${v.idVehiculo}`} />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => router.push(`/resenas?tipo=vehiculo&receptorId=${v.idVehiculo}`)}
                    >
                      <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Ver reseñas
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Alquiladores ─────────────────────────────────────
function TabAlquiladores() {
  const router = useRouter();
  const [items, setItems] = useState<Alquilador[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/proxy/buyer/api/alquilador/');
    const d = await r.json();
    setItems(d.alquiladores ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return <Loading />;

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th>
              <th>DNI</th><th>Licencia</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(a => (
              <tr key={a.idAlquilador}>
                <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{a.idAlquilador}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{a.nombre} {a.apellido}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.direccion}</div>
                </td>
                <td style={{ fontSize: 12 }}>{a.email}</td>
                <td style={{ fontSize: 12 }}>{a.dni}</td>
                <td style={{ fontSize: 12 }}>{a.licenciaConducir}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <PromedioBtn tipo="alquilador" id={a.idAlquilador} />
                    <ResumenBtn tipo="alquilador" id={a.idAlquilador} label={`${a.nombre} ${a.apellido} #${a.idAlquilador}`} />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => router.push(`/resenas?tipo=alquilador&receptorId=${a.idAlquilador}`)}
                    >
                      <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Ver reseñas
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Propietarios ─────────────────────────────────────
function TabPropietarios() {
  const router = useRouter();
  const [items, setItems] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/proxy/seller/api/propietario/');
    const d = await r.json();
    setItems(d.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  if (loading) return <Loading />;

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th><th>DNI</th><th>Dirección</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p.idPropietario}>
                <td style={{ fontSize: 12, color: "var(--text-muted)" }}>#{p.idPropietario}</td>
                <td style={{ fontWeight: 500 }}>{p.nombre} {p.apellido}</td>
                <td style={{ fontSize: 12 }}>{p.email}</td>
                <td style={{ fontSize: 12 }}>{p.dni}</td>
                <td style={{ fontSize: 12 }}>{p.direccion}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <PromedioBtn tipo="propietario" id={p.idPropietario} />
                    <ResumenBtn tipo="propietario" id={p.idPropietario} label={`${p.nombre} ${p.apellido} #${p.idPropietario}`} />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => router.push(`/resenas?tipo=propietario&receptorId=${p.idPropietario}`)}
                    >
                      <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} /> Ver reseñas
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "vehiculos",    label: "Vehículos",    icon: <Car size={14} /> },
  { id: "alquiladores", label: "Alquiladores", icon: <User size={14} /> },
  { id: "propietarios", label: "Propietarios", icon: <Key size={14} /> },
];

export default function EntidadesPage() {
  const [tab, setTab] = useState<Tab>("vehiculos");

  return (
    <div>
      <PageHeader
        title={<> <Folder size={32} style={{ verticalAlign: "text-bottom", marginRight: 8 }} /> Entidades</>}
        subtitle="Vehículos, alquiladores y propietarios del sistema"
      />

      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "vehiculos"    && <TabVehiculos />}
      {tab === "alquiladores" && <TabAlquiladores />}
      {tab === "propietarios" && <TabPropietarios />}
    </div>
  );
}