import * as RespuestaModel from "@/app/models/respuestaModel";
import { NextResponse } from "next/server";
import { CreateRespuestaDto } from "@/lib/types";

// ── GET /api/respuesta ───────────────────────────────────
export async function getAllRespuestas() {
  try {
    const respuestas = await RespuestaModel.findAllRespuestas();
    return NextResponse.json({ respuestas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener respuestas" }, { status: 500 });
  }
}

// ── GET /api/respuesta/:id ───────────────────────────────
export async function getRespuestaById(id: number) {
  try {
    const respuesta = await RespuestaModel.findRespuestaById(id);
    if (!respuesta) return NextResponse.json({ error: "Respuesta no encontrada" }, { status: 404 });
    return NextResponse.json({ respuesta });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener respuesta" }, { status: 500 });
  }
}

// ── POST /api/respuesta ──────────────────────────────────
export async function postRespuesta(body: unknown) {
  try {
    const dto = body as CreateRespuestaDto;

    if (!dto.idResena || !dto.idAutor || !dto.comentario) {
      return NextResponse.json(
        { error: "Campos requeridos: id_resena, id_autor, comentario" },
        { status: 400 }
      );
    }

    // Verificar que no exista ya una respuesta para esa reseña
    const existente = await RespuestaModel.findRespuestaByResena(dto.idResena);
    if (existente) {
      return NextResponse.json(
        { error: "Ya existe una respuesta para esta reseña" },
        { status: 409 }
      );
    }

    const respuesta = await RespuestaModel.createRespuesta(dto);
    return NextResponse.json({ respuesta }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear respuesta" }, { status: 500 });
  }
}

// ── PUT /api/respuesta/:id ───────────────────────────────
export async function putRespuesta(id: number, body: unknown) {
  try {
    const { comentario } = body as { comentario: string };

    if (!comentario) {
      return NextResponse.json({ error: "El campo 'comentario' es requerido" }, { status: 400 });
    }

    const respuesta = await RespuestaModel.updateRespuesta(id, comentario);
    return NextResponse.json({ respuesta });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Respuesta no encontrada" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar respuesta" }, { status: 500 });
  }
}

// ── DELETE /api/respuesta/:id ────────────────────────────
export async function deleteRespuesta(id: number) {
  try {
    await RespuestaModel.deleteRespuesta(id);
    return NextResponse.json({ message: "Respuesta eliminada correctamente" });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Respuesta no encontrada" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar respuesta" }, { status: 500 });
  }
}
