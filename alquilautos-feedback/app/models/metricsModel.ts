import { db } from "@/lib/prisma";
import { Prisma, EstadoModeracion } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────
export type Periodo = "semana" | "mes" | "anio" | "total";
export type TipoEntidad = "alquilador" | "propietario" | "vehiculo";
export type Orden = "desc" | "asc";

function getFechaDesde(periodo: Periodo): Date | undefined {
  if (periodo === "total") return undefined;
  const d = new Date();
  if (periodo === "semana") d.setDate(d.getDate() - 7);
  if (periodo === "mes")    d.setDate(d.getDate() - 30);
  if (periodo === "anio")   d.setFullYear(d.getFullYear() - 1);
  return d;
}

// ── Ranking de entidades ──────────────────────────────────
// Devuelve un ranking de entidades ordenado por calificacion promedio.
// Solo considera reseñas con al menos una moderacion Aprobada.
export async function getRanking(
  tipo: TipoEntidad,
  periodo: Periodo,
  orden: Orden,
  limit: number
) {
  const fechaDesde = getFechaDesde(periodo);

  const whereBase = {
    moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
    ...(fechaDesde ? { fechaCreacion: { gte: fechaDesde } } : {}),
  };

  if (tipo === "alquilador") {
    const resenas = await db.resena.findMany({
      where: { ...whereBase, resenaAlquilador: { isNot: null } },
      select: {
        calificacionGeneral: true,
        resenaAlquilador: { select: { idAlquilador: true } },
      },
    });

    return agruparYOrdenar(
      resenas.map(r => ({
        id: r.resenaAlquilador!.idAlquilador,
        calificacion: r.calificacionGeneral,
      })),
      "id_alquilador",
      orden,
      limit
    );
  }

  if (tipo === "propietario") {
    const resenas = await db.resena.findMany({
      where: { ...whereBase, resenaPropietario: { isNot: null } },
      select: {
        calificacionGeneral: true,
        resenaPropietario: { select: { idPropietario: true } },
      },
    });

    return agruparYOrdenar(
      resenas.map(r => ({
        id: r.resenaPropietario!.idPropietario,
        calificacion: r.calificacionGeneral,
      })),
      "id_propietario",
      orden,
      limit
    );
  }

  // vehiculo
  const resenas = await db.resena.findMany({
    where: { ...whereBase, resenaVehiculo: { isNot: null } },
    select: {
      calificacionGeneral: true,
      resenaVehiculo: { select: { idVehiculo: true } },
    },
  });

  return agruparYOrdenar(
    resenas.map(r => ({
      id: r.resenaVehiculo!.idVehiculo,
      calificacion: r.calificacionGeneral,
    })),
    "id_vehiculo",
    orden,
    limit
  );
}

// Agrupa por entidad, calcula promedio y ordena
function agruparYOrdenar(
  items: { id: string | number; calificacion: number }[],
  idKey: string,
  orden: Orden,
  limit: number
) {
  const map: Record<string, { suma: number; cantidad: number }> = {};

  for (const item of items) {
    const k = String(item.id);
    if (!map[k]) map[k] = { suma: 0, cantidad: 0 };
    map[k].suma      += item.calificacion;
    map[k].cantidad  += 1;
  }

  return Object.entries(map)
    .map(([id, { suma, cantidad }]) => ({
      [idKey]: id,
      calificacion_promedio: Math.round((suma / cantidad) * 100) / 100,
      cantidad_resenas:      cantidad,
    }))
    .sort((a, b) =>
      orden === "desc"
        ? b.calificacion_promedio - a.calificacion_promedio
        : a.calificacion_promedio - b.calificacion_promedio
    )
    .slice(0, limit);
}

// ── Resumen global ────────────────────────────────────────
export async function getResumenGlobal() {
  const ahora     = new Date();
  const haceUnaSemana = new Date(ahora); haceUnaSemana.setDate(ahora.getDate() - 7);
  const haceUnMes     = new Date(ahora); haceUnMes.setDate(ahora.getDate() - 30);

  const [
    totalResenas,
    resenasConModAprobada,
    resenasConModRechazada,
    resenasConModPendiente,
    resenasConRespuesta,
    resenasUltimaSemana,
    resenasUltimoMes,
    promedioGlobal,
  ] = await Promise.all([
    // Total de reseñas
    db.resena.count(),

    // Aprobadas (tienen al menos una mod aprobada)
    db.resena.count({
      where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } },
    }),

    // Rechazadas (tienen mod rechazada y ninguna aprobada posterior)
    db.resena.count({
      where: {
        moderaciones: { some: { estado: EstadoModeracion.RECHAZADA } },
        NOT: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } },
      },
    }),

    // Pendientes (solo mod pendiente)
    db.resena.count({
      where: {
        moderaciones: { every: { estado: EstadoModeracion.PENDIENTE } },
      },
    }),

    // Con respuesta
    db.resena.count({ where: { respuesta: { isNot: null } } }),

    // Última semana (aprobadas)
    db.resena.count({
      where: {
        moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
        fechaCreacion: { gte: haceUnaSemana },
      },
    }),

    // Último mes (aprobadas)
    db.resena.count({
      where: {
        moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
        fechaCreacion: { gte: haceUnMes },
      },
    }),

    // Promedio global (solo aprobadas)
    db.resena.aggregate({
      where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } },
      _avg: { calificacionGeneral: true },
    }),
  ]);

  const tasa_aprobacion  = totalResenas > 0 ? Math.round((resenasConModAprobada  / totalResenas) * 1000) / 10 : 0;
  const tasa_respuesta   = resenasConModAprobada > 0 ? Math.round((resenasConRespuesta / resenasConModAprobada) * 1000) / 10 : 0;

  return {
    total_resenas:           totalResenas,
    total_aprobadas:         resenasConModAprobada,
    total_rechazadas:        resenasConModRechazada,
    total_pendientes:        resenasConModPendiente,
    tasa_aprobacion,
    calificacion_promedio_global: Math.round((promedioGlobal._avg.calificacionGeneral ?? 0) * 100) / 100,
    resenas_con_respuesta:   resenasConRespuesta,
    tasa_respuesta,
    resenas_ultima_semana:   resenasUltimaSemana,
    resenas_ultimo_mes:      resenasUltimoMes,
  };
}

// ── Tendencia temporal ────────────────────────────────────
export type Granularidad = "semana" | "mes";

export async function getTendencia(granularidad: Granularidad, cantidad: number) {
  // Traer todas las reseñas aprobadas con fecha y calificacion
  const resenas = await db.resena.findMany({
    where: { moderaciones: { some: { estado: EstadoModeracion.APROBADA } } },
    select: { calificacionGeneral: true, fechaCreacion: true },
    orderBy: { fechaCreacion: "asc" },
  });

  // Agrupar por periodo
  const map: Record<string, { suma: number; cantidad: number }> = {};

  for (const r of resenas) {
    const key = granularidad === "mes"
      ? r.fechaCreacion.toISOString().slice(0, 7)        // "2025-03"
      : getISOWeekKey(r.fechaCreacion);                  // "2025-W12"

    if (!map[key]) map[key] = { suma: 0, cantidad: 0 };
    map[key].suma     += r.calificacionGeneral;
    map[key].cantidad += 1;
  }

  const datos = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-cantidad)                                     // últimos N periodos
    .map(([periodo, { suma, cantidad }]) => ({
      periodo,
      cantidad_resenas:     cantidad,
      calificacion_promedio: Math.round((suma / cantidad) * 100) / 100,
    }));

  return datos;
}

function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// ── Distribución de calificaciones ───────────────────────
export async function getDistribucion(tipo?: TipoEntidad) {
  const whereBase = {
    moderaciones: { some: { estado: EstadoModeracion.APROBADA } },
    ...(tipo === "alquilador"  ? { resenaAlquilador:  { isNot: null } } : {}),
    ...(tipo === "propietario" ? { resenaPropietario: { isNot: null } } : {}),
    ...(tipo === "vehiculo"    ? { resenaVehiculo:    { isNot: null } } : {}),
  };

  const resenas = await db.resena.findMany({
    where: whereBase,
    select: { calificacionGeneral: true },
  });

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of resenas) dist[r.calificacionGeneral] = (dist[r.calificacionGeneral] ?? 0) + 1;

  const total = resenas.length;
  return Object.entries(dist).map(([cal, cantidad]) => ({
    calificacion:  Number(cal),
    cantidad,
    porcentaje:    total > 0 ? Math.round((cantidad / total) * 1000) / 10 : 0,
  }));
}
