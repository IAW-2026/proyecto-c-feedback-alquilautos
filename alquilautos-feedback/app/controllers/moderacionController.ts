import * as ModeracionModel from "@/app/models/moderacionModel";
import { EstadoModeracion } from "@prisma/client";
import { NextResponse } from "next/server";
import { CreateModeracionDto } from "@/lib/types";

const ESTADOS_VALIDOS = Object.values(EstadoModeracion);

// ── GET /api/moderacion ──────────────────────────────────
export async function getAllModeraciones(soloPendientes = false) {
  try {
    const moderaciones = soloPendientes
      ? await ModeracionModel.findModeracionesPendientes()
      : await ModeracionModel.findAllModeraciones();
    return NextResponse.json({ moderaciones });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener moderaciones" }, { status: 500 });
  }
}

// ── GET /api/moderacion/:id ──────────────────────────────
export async function getModeracionById(id: number) {
  try {
    const moderacion = await ModeracionModel.findModeracionById(id);
    if (!moderacion) return NextResponse.json({ error: "Moderación no encontrada" }, { status: 404 });
    return NextResponse.json({ moderacion });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener moderación" }, { status: 500 });
  }
}

// ── POST /api/moderacion ─────────────────────────────────
export async function postModeracion(body: unknown, idModerador: string) {
  try {
    const dto = body as CreateModeracionDto;

    if (!dto.idResena) {
      return NextResponse.json(
        { error: "Campo requerido: idResena" },
        { status: 400 }
      );
    }

    if (dto.estado && !ESTADOS_VALIDOS.includes(dto.estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    if (dto.estado === "RECHAZADA" && !dto.motivo) {
      return NextResponse.json(
        { error: "Se requiere un motivo al rechazar una moderación" },
        { status: 400 }
      );
    }

    const moderacion = await ModeracionModel.createModeracion({ ...dto, idModerador });
    return NextResponse.json({ moderacion }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear moderación" }, { status: 500 });
  }
}

// ── PATCH /api/moderacion/:id ────────────────────────────
export async function patchModeracionEstado(id: number, body: unknown) {
  try {
    const { estado, motivo } = body as { estado: EstadoModeracion; motivo?: string };

    if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json(
        { error: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}` },
        { status: 400 }
      );
    }

    if (estado === "RECHAZADA" && !motivo) {
      return NextResponse.json(
        { error: "Se requiere un motivo al rechazar una moderación" },
        { status: 400 }
      );
    }

    const moderacion = await ModeracionModel.updateModeracionEstado(id, estado, motivo);
    return NextResponse.json({ moderacion });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Moderación no encontrada" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar moderación" }, { status: 500 });
  }
}

// ── DELETE /api/moderacion/:id ───────────────────────────
export async function deleteModeracion(id: number) {
  try {
    await ModeracionModel.deleteModeracion(id);
    return NextResponse.json({ message: "Moderación eliminada correctamente" });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Moderación no encontrada" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar moderación" }, { status: 500 });
  }
}
