import { db } from "@/lib/prisma";
import { EstadoModeracion } from "@prisma/client";
import { getMockAlquilador, getMockPropietario, getMockVehiculo } from "@/lib/mocks";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

// ── Tipos compartidos ─────────────────────────────────────
export type Periodo    = "semana" | "mes" | "anio" | "total";
export type TipoEntidad = "alquilador" | "propietario" | "vehiculo";
export type Orden       = "desc" | "asc";
export type Granularidad = "semana" | "mes";

export function getFechaDesde(periodo: Periodo): Date | undefined {
  if (periodo === "total") return undefined;
  const d = new Date();
  if (periodo === "semana") d.setDate(d.getDate() - 7);
  if (periodo === "mes")    d.setDate(d.getDate() - 30);
  if (periodo === "anio")   d.setFullYear(d.getFullYear() - 1);
  return d;
}

// ── Util: agrupar items por entidad y calcular promedio ───
function agruparYOrdenar(
  items:  { id: string | number; calificacion: number }[],
  idKey:  string,
  orden:  Orden,
  limit:  number
) {
  const map: Record<string, { suma: number; cantidad: number }> = {};
  for (const item of items) {
    const k = String(item.id);
    if (!map[k]) map[k] = { suma: 0, cantidad: 0 };
    map[k].suma     += item.calificacion;
    map[k].cantidad += 1;
  }
  return Object.entries(map)
    .map(([id, { suma, cantidad }]) => ({
      [idKey]: id,
      calificacion_promedio: Math.round((suma / cantidad) * 100) / 100,
      cantidad_resenas: cantidad,
    }))
    .sort((a, b) =>
      orden === "desc"
        ? b.calificacion_promedio - a.calificacion_promedio
        : a.calificacion_promedio - b.calificacion_promedio
    )
    .slice(0, limit);
}

// ── Helper: obtener nombre para mostrar de una entidad ───
async function fetchEntityName(tipo: TipoEntidad, id: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const clientHeaders = await headers();
    const cookie = clientHeaders.get("cookie") || "";
    const { getToken } = await auth();
    const token = await getToken();
    const hdrs: Record<string, string> = { "Content-Type": "application/json", Cookie: cookie };
    if (token) hdrs["Authorization"] = `Bearer ${token}`;

    let endpoint = "";
    if (tipo === "alquilador") endpoint = `/api/proxy/buyer/api/alquilador/${id}`;
    else if (tipo === "propietario") endpoint = `/api/proxy/seller/api/propietario/${id}`;
    else if (tipo === "vehiculo") endpoint = `/api/proxy/seller/api/vehiculo/${id}`;

    if (endpoint) {
      const res = await fetch(`${baseUrl}${endpoint}`, { headers: hdrs });
      if (res.ok) {
        const data = await res.json();
        if (tipo === "vehiculo") {
          if (data.marca && data.modelo) return `${data.marca} ${data.modelo}`;
        } else {
          if (data.nombre && data.apellido) return `${data.nombre} ${data.apellido}`;
        }
      }
    }
  } catch {
    // fallback a mock o ID
  }
  if (tipo === "alquilador") {
    const mock = getMockAlquilador(id);
    if (mock) return `${mock.nombre} ${mock.apellido}`;
  }
  if (tipo === "propietario") {
    const mock = getMockPropietario(id);
    if (mock) return `${mock.nombre} ${mock.apellido}`;
  }
  if (tipo === "vehiculo") {
    const mock = getMockVehiculo(id);
    if (mock) return `${mock.marca} ${mock.modelo}`;
  }
  return `(ID: ${id})`;
}

// ── Helper: obtener nombre del emisor (quien escribe reseñas) ─
async function fetchEmisorName(id: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const clientHeaders = await headers();
    const cookie = clientHeaders.get("cookie") || "";
    const { getToken } = await auth();
    const token = await getToken();
    const hdrs: Record<string, string> = { "Content-Type": "application/json", Cookie: cookie };
    if (token) hdrs["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}/api/proxy/buyer/api/alquilador/${id}`, { headers: hdrs });
    if (res.ok) {
      const data = await res.json();
      if (data.nombre && data.apellido) return `${data.nombre} ${data.apellido}`;
    }
  } catch {
    // fallback
  }
  const mock = getMockAlquilador(id);
  if (mock) return `${mock.nombre} ${mock.apellido}`;
  return `(ID: ${id})`;
}

async function enrichEntities<T extends Record<string, any>>(
  tipo: TipoEntidad,
  items: T[],
  idKey: string
): Promise<T[]> {
  const uniqueIds = [...new Set(items.map(item => String(item[idKey])))];
  const names = new Map<string, string>();
  await Promise.all(
    uniqueIds.map(async (id) => {
      names.set(id, await fetchEntityName(tipo, id));
    })
  );
  return items.map(item => ({
    ...item,
    nombre_entidad: names.get(String(item[idKey])) ?? `(ID: ${item[idKey]})`,
  }));
}

// ── Ranking ───────────────────────────────────────────────
export async function getRanking(
  tipo:    TipoEntidad,
  periodo: Periodo,
  orden:   Orden,
  limit:   number
) {
  const fechaDesde = getFechaDesde(periodo);
  const whereBase = {
    moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
    ...(fechaDesde ? { fechaCreacion: { gte: fechaDesde } } : {}),
  };

  let ranking: any[];
  if (tipo === "alquilador") {
    const rows = await db.resena.findMany({
      where: { ...whereBase, resenaAlquilador: { isNot: null } },
      select: { calificacionGeneral: true, resenaAlquilador: { select: { idAlquilador: true } } },
    });
    ranking = agruparYOrdenar(
      rows.map(r => ({ id: r.resenaAlquilador!.idAlquilador, calificacion: r.calificacionGeneral })),
      "id_alquilador", orden, limit
    );
  } else if (tipo === "propietario") {
    const rows = await db.resena.findMany({
      where: { ...whereBase, resenaPropietario: { isNot: null } },
      select: { calificacionGeneral: true, resenaPropietario: { select: { idPropietario: true } } },
    });
    ranking = agruparYOrdenar(
      rows.map(r => ({ id: r.resenaPropietario!.idPropietario, calificacion: r.calificacionGeneral })),
      "id_propietario", orden, limit
    );
  } else {
    const rows = await db.resena.findMany({
      where: { ...whereBase, resenaVehiculo: { isNot: null } },
      select: { calificacionGeneral: true, resenaVehiculo: { select: { idVehiculo: true } } },
    });
    ranking = agruparYOrdenar(
      rows.map(r => ({ id: r.resenaVehiculo!.idVehiculo, calificacion: r.calificacionGeneral })),
      "id_vehiculo", orden, limit
    );
  }
  const idKey = tipo === "alquilador" ? "id_alquilador" : tipo === "propietario" ? "id_propietario" : "id_vehiculo";
  return enrichEntities(tipo, ranking, idKey);
}

// ── Resumen global ────────────────────────────────────────
export async function getResumenGlobal() {
  const ahora        = new Date();
  const haceUnaSemana = new Date(ahora); haceUnaSemana.setDate(ahora.getDate() - 7);
  const haceUnMes     = new Date(ahora); haceUnMes.setDate(ahora.getDate() - 30);

  const [
    totalResenas, aprobadas, rechazadas, pendientes,
    conRespuesta, ultimaSemana, ultimoMes, promedioAgg,
  ] = await Promise.all([
    db.resena.count(),
    db.resena.count({ where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } } }),
    db.resena.count({ where: { moderaciones: { some: { estado: EstadoModeracion.RECHAZADA } }, NOT: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } } } }),
    db.resena.count({ where: { moderaciones: { every: { estado: EstadoModeracion.PENDIENTE } } } }),
    db.resena.count({ where: { respuesta: { isNot: null } } }),
    db.resena.count({ where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } }, fechaCreacion: { gte: haceUnaSemana } } }),
    db.resena.count({ where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } }, fechaCreacion: { gte: haceUnMes } } }),
    db.resena.aggregate({ where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } }, _avg: { calificacionGeneral: true } }),
  ]);

  return {
    total_resenas:                totalResenas,
    total_aprobadas:              aprobadas,
    total_rechazadas:             rechazadas,
    total_pendientes:             pendientes,
    tasa_aprobacion:              totalResenas > 0 ? Math.round((aprobadas / totalResenas) * 1000) / 10 : 0,
    calificacion_promedio_global: Math.round((promedioAgg._avg.calificacionGeneral ?? 0) * 100) / 100,
    resenas_con_respuesta:        conRespuesta,
    tasa_respuesta:               aprobadas > 0 ? Math.round((conRespuesta / aprobadas) * 1000) / 10 : 0,
    resenas_ultima_semana:        ultimaSemana,
    resenas_ultimo_mes:           ultimoMes,
  };
}

// ── Tendencia temporal ────────────────────────────────────
export async function getTendencia(granularidad: Granularidad, cantidad: number) {
  const resenas = await db.resena.findMany({
    where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } },
    select: { calificacionGeneral: true, fechaCreacion: true },
    orderBy: { fechaCreacion: "asc" },
  });

  const map: Record<string, { suma: number; cantidad: number }> = {};
  for (const r of resenas) {
    const key = granularidad === "mes"
      ? r.fechaCreacion.toISOString().slice(0, 7)
      : getISOWeekKey(r.fechaCreacion);
    if (!map[key]) map[key] = { suma: 0, cantidad: 0 };
    map[key].suma     += r.calificacionGeneral;
    map[key].cantidad += 1;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-cantidad)
    .map(([periodo, { suma, cantidad }]) => ({
      periodo,
      cantidad_resenas:      cantidad,
      calificacion_promedio: Math.round((suma / cantidad) * 100) / 100,
    }));
}

function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1   = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ── Distribución de calificaciones ───────────────────────
export async function getDistribucion(tipo?: TipoEntidad) {
  const resenas = await db.resena.findMany({
    where: {
      moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
      ...(tipo === "alquilador"  ? { resenaAlquilador:  { isNot: null } } : {}),
      ...(tipo === "propietario" ? { resenaPropietario: { isNot: null } } : {}),
      ...(tipo === "vehiculo"    ? { resenaVehiculo:    { isNot: null } } : {}),
    },
    select: { calificacionGeneral: true },
  });

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of resenas) dist[r.calificacionGeneral] = (dist[r.calificacionGeneral] ?? 0) + 1;
  const total = resenas.length;

  return Object.entries(dist).map(([cal, cantidad]) => ({
    calificacion: Number(cal),
    cantidad,
    porcentaje: total > 0 ? Math.round((cantidad / total) * 1000) / 10 : 0,
  }));
}

// ═════════════════════════════════════════════════════════
// NUEVAS MÉTRICAS
// ═════════════════════════════════════════════════════════

// ── 1. Tiempo promedio de moderación ─────────────────────
// Mide cuántos días pasan entre la creación de una reseña
// y su primera moderación. Segmentado por estado final.
export async function getTiempoPromedioModeracion() {
  const moderaciones = await db.moderacion.findMany({
    select: {
      fechaCreacion: true,
      estado:        true,
      resena:        { select: { fechaCreacion: true } },
    },
  });

  if (moderaciones.length === 0) {
    return {
      promedio_dias: 0, mediana_dias: 0, percentil_90_dias: 0,
      total_moderaciones: 0, por_estado: {},
    };
  }

  const calcDias = (m: typeof moderaciones[0]) =>
    (m.fechaCreacion.getTime() - m.resena.fechaCreacion.getTime()) / 86_400_000;

  // Ignorar diferencias negativas (datos inconsistentes)
  const validos  = moderaciones.filter(m => calcDias(m) >= 0);
  const diasList = validos.map(calcDias).sort((a, b) => a - b);

  const promedio = diasList.reduce((a, b) => a + b, 0) / diasList.length;
  const mediana  = diasList[Math.floor(diasList.length / 2)];
  const p90      = diasList[Math.floor(diasList.length * 0.9)];

  // Agrupar por estado
  const porEstadoRaw: Record<string, number[]> = {};
  for (const m of validos) {
    if (!porEstadoRaw[m.estado]) porEstadoRaw[m.estado] = [];
    porEstadoRaw[m.estado].push(calcDias(m));
  }

  const por_estado = Object.fromEntries(
    Object.entries(porEstadoRaw).map(([estado, dias]) => [
      estado,
      {
        promedio_dias: Math.round((dias.reduce((a, b) => a + b, 0) / dias.length) * 100) / 100,
        mediana_dias:  Math.round(dias.sort((a, b) => a - b)[Math.floor(dias.length / 2)] * 100) / 100,
        cantidad:      dias.length,
      },
    ])
  );

  return {
    promedio_dias:      Math.round(promedio * 100) / 100,
    mediana_dias:       Math.round(mediana  * 100) / 100,
    percentil_90_dias:  Math.round(p90      * 100) / 100,
    total_moderaciones: validos.length,
    por_estado,
  };
}

// ── 2. Entidades con caída brusca de calificación ────────
// Compara el promedio histórico (antes de X días) con el
// promedio reciente (últimos X días). Alerta si la diferencia
// supera el umbral y hay suficientes reseñas recientes.
export async function getCaidaCalificacion(
  tipo:               TipoEntidad,
  diasReciente:       number,  // cuántos días atrás define "reciente"
  umbralCaida:        number,  // mínima caída en puntos para alertar
  minResenasRecientes: number  // mínimo de reseñas recientes para ser significativo
) {
  const fechaCorte = new Date();
  fechaCorte.setDate(fechaCorte.getDate() - diasReciente);

  const selectBase = {
    calificacionGeneral: true,
    fechaCreacion: true,
    ...(tipo === "alquilador"  ? { resenaAlquilador:  { select: { idAlquilador:  true } } } : {}),
    ...(tipo === "propietario" ? { resenaPropietario: { select: { idPropietario: true } } } : {}),
    ...(tipo === "vehiculo"    ? { resenaVehiculo:    { select: { idVehiculo:    true } } } : {}),
  };

  const resenas = await db.resena.findMany({
    where: {
      moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
      ...(tipo === "alquilador"  ? { resenaAlquilador:  { isNot: null } } : {}),
      ...(tipo === "propietario" ? { resenaPropietario: { isNot: null } } : {}),
      ...(tipo === "vehiculo"    ? { resenaVehiculo:    { isNot: null } } : {}),
    },
    select: selectBase,
  });

  const getEntityId = (r: typeof resenas[0]): string => {
    if (tipo === "alquilador"  && r.resenaAlquilador)  return String(r.resenaAlquilador.idAlquilador);
    if (tipo === "propietario" && r.resenaPropietario) return String(r.resenaPropietario.idPropietario);
    if (tipo === "vehiculo"    && r.resenaVehiculo)    return String(r.resenaVehiculo.idVehiculo);
    return "unknown";
  };

  // Agrupar reseñas en histórico vs reciente por entidad
  const byEntity: Record<string, { historico: number[]; reciente: number[] }> = {};
  for (const r of resenas) {
    const id = getEntityId(r);
    if (!byEntity[id]) byEntity[id] = { historico: [], reciente: [] };
    if (r.fechaCreacion >= fechaCorte) byEntity[id].reciente.push(r.calificacionGeneral);
    else                               byEntity[id].historico.push(r.calificacionGeneral);
  }

  const idKey = tipo === "alquilador" ? "id_alquilador" : tipo === "propietario" ? "id_propietario" : "id_vehiculo";
  const avg   = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  let results = Object.entries(byEntity)
    .filter(([, { historico, reciente }]) =>
      reciente.length >= minResenasRecientes && historico.length >= 1
    )
    .map(([id, { historico, reciente }]) => {
      const promHistorico = avg(historico);
      const promReciente  = avg(reciente);
      const caida         = promHistorico - promReciente;
      return {
        [idKey]:             id,
        promedio_historico:  Math.round(promHistorico * 100) / 100,
        promedio_reciente:   Math.round(promReciente  * 100) / 100,
        caida:               Math.round(caida * 100) / 100,
        resenas_historicas:  historico.length,
        resenas_recientes:   reciente.length,
      };
    })
    .filter(e => e.caida >= umbralCaida)
    .sort((a, b) => b.caida - a.caida);

  return enrichEntities(tipo, results, idKey);
}

// ── 3. Emisores recurrentes ───────────────────────────────
// Lista usuarios que escribieron >= minResenas reseñas,
// con su cantidad total y calificación promedio emitida.
export async function getEmisoresRecurrentes(minResenas: number, limit: number) {
  const resenas = await db.resena.findMany({
    select: { idEmisor: true, calificacionGeneral: true, fechaCreacion: true },
    orderBy: { fechaCreacion: "desc" },
  });

  const byEmisor: Record<string, { calificaciones: number[]; ultimaFecha: Date }> = {};
  for (const r of resenas) {
    const id = String(r.idEmisor);
    if (!byEmisor[id]) {
      byEmisor[id] = { calificaciones: [], ultimaFecha: r.fechaCreacion };
    }
    byEmisor[id].calificaciones.push(r.calificacionGeneral);
    // ultimaFecha ya es la más reciente porque se ordena desc
  }

  let resultados = Object.entries(byEmisor)
    .filter(([, { calificaciones }]) => calificaciones.length >= minResenas)
    .map(([id, { calificaciones, ultimaFecha }]) => ({
      id_emisor:                   id,
      cantidad_resenas:            calificaciones.length,
      calificacion_promedio_emitida: Math.round(
        (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length) * 100
      ) / 100,
      ultima_resena: ultimaFecha,
    }))
    .sort((a, b) => b.cantidad_resenas - a.cantidad_resenas)
    .slice(0, limit);

  // Enriquecer con nombre del emisor
  const names = new Map<string, string>();
  const uniqueIds = [...new Set(resultados.map(r => r.id_emisor))];
  await Promise.all(uniqueIds.map(async id => names.set(id, await fetchEmisorName(id))));
  return resultados.map(r => ({ ...r, nombre_entidad: names.get(r.id_emisor) ?? `(ID: ${r.id_emisor})` }));
}

// ── 4. Concentración de rechazos por emisor ──────────────
// Detecta emisores cuya tasa de rechazo (última moderación
// = Rechazada / total reseñas) supera un umbral.
// Útil para detectar usuarios que envían contenido inapropiado.
export async function getRechazosConcentrados(
  minResenas:  number,  // mínimo de reseñas para ser significativo
  umbralTasa:  number,  // tasa mínima de rechazo (0-1) para alertar
  limit:       number
) {
  const resenas = await db.resena.findMany({
    select: {
      idEmisor:     true,
      // Solo la moderación más reciente de cada reseña
      moderaciones: {
        select:    { estado: true },
        orderBy:   { fechaCreacion: "desc" },
        take:       1,
      },
    },
  });

  const byEmisor: Record<string, { total: number; rechazadas: number; pendientes: number }> = {};
  for (const r of resenas) {
    const id = String(r.idEmisor);
    if (!byEmisor[id]) byEmisor[id] = { total: 0, rechazadas: 0, pendientes: 0 };
    byEmisor[id].total++;
    const estadoActual = r.moderaciones[0]?.estado;
    if (estadoActual === EstadoModeracion.RECHAZADA) byEmisor[id].rechazadas++;
    if (estadoActual === EstadoModeracion.PENDIENTE) byEmisor[id].pendientes++;
  }

  let resultados = Object.entries(byEmisor)
    .filter(([, { total }]) => total >= minResenas)
    .map(([id, { total, rechazadas, pendientes }]) => ({
      id_emisor:          id,
      total_resenas:      total,
      resenas_rechazadas: rechazadas,
      resenas_pendientes: pendientes,
      tasa_rechazo:       Math.round((rechazadas / total) * 1000) / 10, // porcentaje
    }))
    .filter(e => e.tasa_rechazo / 100 >= umbralTasa)
    .sort((a, b) => b.tasa_rechazo - a.tasa_rechazo)
    .slice(0, limit);

  // Enriquecer con nombre del emisor
  const names = new Map<string, string>();
  const uniqueIds = [...new Set(resultados.map(r => r.id_emisor))];
  await Promise.all(uniqueIds.map(async id => names.set(id, await fetchEmisorName(id))));
  return resultados.map(r => ({ ...r, nombre_entidad: names.get(r.id_emisor) ?? `(ID: ${r.id_emisor})` }));
}
