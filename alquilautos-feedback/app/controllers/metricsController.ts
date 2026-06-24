import { NextResponse } from "next/server";
import {
  getRanking, getResumenGlobal, getTendencia, getDistribucion,
  type Periodo, type TipoEntidad, type Orden, type Granularidad,
} from "@/app/models/metricsModel";

const TIPOS_VALIDOS:       TipoEntidad[] = ["alquilador", "propietario", "vehiculo"];
const PERIODOS_VALIDOS:    Periodo[]     = ["semana", "mes", "anio", "total"];
const ORDENES_VALIDOS:     Orden[]       = ["desc", "asc"];
const GRANULARIDADES_VALIDAS: Granularidad[] = ["semana", "mes"];

// ── GET /api/metrics/ranking/:tipo ────────────────────────
// ?periodo=semana|mes|anio|total  (default: total)
// ?orden=desc|asc                 (default: desc = mejores primero)
// ?limit=5                        (default: 5, max: 20)
export async function getRankingHandler(
  tipo: string,
  searchParams: URLSearchParams
) {
  try {
    if (!TIPOS_VALIDOS.includes(tipo as TipoEntidad)) {
      return NextResponse.json(
        { error: `Tipo inválido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    const periodo = (searchParams.get("periodo") ?? "total") as Periodo;
    const orden   = (searchParams.get("orden")   ?? "desc")  as Orden;
    const limit   = Math.min(Number(searchParams.get("limit") ?? "5"), 20);

    if (!PERIODOS_VALIDOS.includes(periodo)) {
      return NextResponse.json(
        { error: `Periodo inválido. Valores permitidos: ${PERIODOS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }
    if (!ORDENES_VALIDOS.includes(orden)) {
      return NextResponse.json(
        { error: `Orden inválido. Valores permitidos: ${ORDENES_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    const ranking = await getRanking(tipo as TipoEntidad, periodo, orden, limit);

    return NextResponse.json({
      tipo,
      periodo,
      orden,
      label: orden === "desc" ? "Mejores" : "Peores",
      ranking,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular ranking" }, { status: 500 });
  }
}

// ── GET /api/metrics/resumen ──────────────────────────────
export async function getResumenHandler() {
  try {
    const resumen = await getResumenGlobal();
    return NextResponse.json(resumen);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener resumen" }, { status: 500 });
  }
}

// ── GET /api/metrics/tendencia ────────────────────────────
// ?granularidad=semana|mes  (default: mes)
// ?cantidad=12              (cuántos períodos hacia atrás, default: 12)
export async function getTendenciaHandler(searchParams: URLSearchParams) {
  try {
    const granularidad = (searchParams.get("granularidad") ?? "mes") as Granularidad;
    const cantidad     = Math.min(Number(searchParams.get("cantidad") ?? "12"), 52);

    if (!GRANULARIDADES_VALIDAS.includes(granularidad)) {
      return NextResponse.json(
        { error: `Granularidad inválida. Valores permitidos: ${GRANULARIDADES_VALIDAS.join(", ")}` },
        { status: 400 }
      );
    }

    const datos = await getTendencia(granularidad, cantidad);
    return NextResponse.json({ granularidad, cantidad_periodos: datos.length, datos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener tendencia" }, { status: 500 });
  }
}

// ── GET /api/metrics/distribucion ────────────────────────
// ?tipo=alquilador|propietario|vehiculo  (opcional, sin filtro = global)
export async function getDistribucionHandler(searchParams: URLSearchParams) {
  try {
    const tipo = searchParams.get("tipo") as TipoEntidad | null;

    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo inválido. Valores permitidos: ${TIPOS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    const distribucion = await getDistribucion(tipo ?? undefined);
    return NextResponse.json({ tipo: tipo ?? "global", distribucion });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener distribución" }, { status: 500 });
  }
}
