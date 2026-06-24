import { NextResponse } from "next/server";
import {
  getRanking, getResumenGlobal, getTendencia, getDistribucion,
  getTiempoPromedioModeracion, getCaidaCalificacion,
  getEmisoresRecurrentes, getRechazosConcentrados,
  type Periodo, type TipoEntidad, type Orden, type Granularidad,
} from "@/app/models/metricsModel";

const TIPOS_VALIDOS:          TipoEntidad[]   = ["alquilador", "propietario", "vehiculo"];
const PERIODOS_VALIDOS:       Periodo[]        = ["semana", "mes", "anio", "total"];
const ORDENES_VALIDOS:        Orden[]          = ["desc", "asc"];
const GRANULARIDADES_VALIDAS: Granularidad[]   = ["semana", "mes"];

// ── GET /api/metrics/ranking/:tipo ────────────────────────
export async function getRankingHandler(tipo: string, sp: URLSearchParams) {
  try {
    if (!TIPOS_VALIDOS.includes(tipo as TipoEntidad))
      return NextResponse.json({ error: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` }, { status: 400 });

    const periodo = (sp.get("periodo") ?? "total") as Periodo;
    const orden   = (sp.get("orden")   ?? "desc")  as Orden;
    const limit   = Math.min(Number(sp.get("limit") ?? "5"), 20);

    if (!PERIODOS_VALIDOS.includes(periodo))
      return NextResponse.json({ error: `Periodo inválido. Permitidos: ${PERIODOS_VALIDOS.join(", ")}` }, { status: 400 });
    if (!ORDENES_VALIDOS.includes(orden))
      return NextResponse.json({ error: `Orden inválido. Permitidos: ${ORDENES_VALIDOS.join(", ")}` }, { status: 400 });

    const ranking = await getRanking(tipo as TipoEntidad, periodo, orden, limit);
    return NextResponse.json({ tipo, periodo, orden, label: orden === "desc" ? "Mejores" : "Peores", ranking });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular ranking" }, { status: 500 });
  }
}

// ── GET /api/metrics/resumen ──────────────────────────────
export async function getResumenHandler() {
  try {
    return NextResponse.json(await getResumenGlobal());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 });
  }
}

// ── GET /api/metrics/tendencia ────────────────────────────
export async function getTendenciaHandler(sp: URLSearchParams) {
  try {
    const granularidad = (sp.get("granularidad") ?? "mes") as Granularidad;
    const cantidad     = Math.min(Number(sp.get("cantidad") ?? "12"), 52);

    if (!GRANULARIDADES_VALIDAS.includes(granularidad))
      return NextResponse.json({ error: `Granularidad inválida. Permitidas: ${GRANULARIDADES_VALIDAS.join(", ")}` }, { status: 400 });

    const datos = await getTendencia(granularidad, cantidad);
    return NextResponse.json({ granularidad, cantidad_periodos: datos.length, datos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener tendencia" }, { status: 500 });
  }
}

// ── GET /api/metrics/distribucion ────────────────────────
export async function getDistribucionHandler(sp: URLSearchParams) {
  try {
    const tipo = sp.get("tipo") as TipoEntidad | null;
    if (tipo && !TIPOS_VALIDOS.includes(tipo))
      return NextResponse.json({ error: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` }, { status: 400 });

    return NextResponse.json({ tipo: tipo ?? "global", distribucion: await getDistribucion(tipo ?? undefined) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener distribución" }, { status: 500 });
  }
}

// ── GET /api/metrics/moderacion-tiempo ───────────────────
// Sin parámetros — devuelve estadísticas globales de demora
// de moderación: promedio, mediana, percentil 90 y desglose
// por estado (Aprobada / Rechazada / Pendiente).
export async function getTiempoModeracionHandler() {
  try {
    return NextResponse.json(await getTiempoPromedioModeracion());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular tiempo de moderación" }, { status: 500 });
  }
}

// ── GET /api/metrics/caida/:tipo ─────────────────────────
// ?dias_reciente=30    días que definen "período reciente"   (default: 30)
// ?umbral=1.0          caída mínima en puntos para alertar   (default: 1.0)
// ?min_resenas=2       mínimo de reseñas recientes requerido (default: 2)
export async function getCaidaHandler(tipo: string, sp: URLSearchParams) {
  try {
    if (!TIPOS_VALIDOS.includes(tipo as TipoEntidad))
      return NextResponse.json({ error: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` }, { status: 400 });

    const diasReciente       = Math.max(Number(sp.get("dias_reciente") ?? "30"), 7);
    const umbralCaida        = Math.max(Number(sp.get("umbral")        ?? "1.0"), 0.1);
    const minResenasRecientes = Math.max(Number(sp.get("min_resenas")  ?? "2"),   1);

    const entidades = await getCaidaCalificacion(
      tipo as TipoEntidad, diasReciente, umbralCaida, minResenasRecientes
    );

    return NextResponse.json({
      tipo,
      parametros: { dias_reciente: diasReciente, umbral_caida: umbralCaida, min_resenas_recientes: minResenasRecientes },
      total_alertas: entidades.length,
      entidades_con_caida: entidades,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular caídas" }, { status: 500 });
  }
}

// ── GET /api/metrics/emisores-recurrentes ────────────────
// ?min_resenas=3   umbral para considerar "recurrente" (default: 3)
// ?limit=10        cuántos devolver                    (default: 10)
export async function getEmisoresRecurrentesHandler(sp: URLSearchParams) {
  try {
    const minResenas = Math.max(Number(sp.get("min_resenas") ?? "3"), 2);
    const limit      = Math.min(Number(sp.get("limit")       ?? "10"), 50);

    const emisores = await getEmisoresRecurrentes(minResenas, limit);

    return NextResponse.json({
      parametros: { min_resenas: minResenas },
      total:      emisores.length,
      emisores,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener emisores recurrentes" }, { status: 500 });
  }
}

// ── GET /api/metrics/rechazos-por-emisor ─────────────────
// ?min_resenas=2     mínimo de reseñas para ser significativo (default: 2)
// ?umbral_tasa=0.5   tasa mínima de rechazo para alertar 0-1  (default: 0.5)
// ?limit=10          cuántos devolver                          (default: 10)
export async function getRechazosEmisorHandler(sp: URLSearchParams) {
  try {
    const minResenas = Math.max(Number(sp.get("min_resenas")  ?? "2"),   1);
    const umbralTasa = Math.min(Math.max(Number(sp.get("umbral_tasa") ?? "0.5"), 0), 1);
    const limit      = Math.min(Number(sp.get("limit")        ?? "10"), 50);

    const emisores = await getRechazosConcentrados(minResenas, umbralTasa, limit);

    return NextResponse.json({
      parametros:    { min_resenas: minResenas, umbral_tasa: umbralTasa },
      total_alertas: emisores.length,
      emisores,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular rechazos por emisor" }, { status: 500 });
  }
}
