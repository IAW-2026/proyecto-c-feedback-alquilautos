import * as ResenaModel from "@/app/models/resenaModel";
import { CreateResenaDto, UpdateResenaDto } from "@/types";
import { NextResponse } from "next/server";

// ── Validar rango de calificación (1-5) ──────────────────
function validarCalificacion(val: unknown, campo: string): string | null {
  if (val === undefined) return null;
  const n = Number(val);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return `El campo '${campo}' debe ser un entero entre 1 y 5`;
  }
  return null;
}

// ── GET /api/resena ──────────────────────────────────────
export async function getAllResenas() {
  try {
    const resenas = await ResenaModel.findAllResenas();
    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 });
  }
}

// ── GET /api/resena/:id ──────────────────────────────────
export async function getResenaById(id: number) {
  try {
    const resena = await ResenaModel.findResenaById(id);
    if (!resena) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    return NextResponse.json({ resena });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseña" }, { status: 500 });
  }
}

// ── POST /api/resena ─────────────────────────────────────
export async function postResena(body: unknown) {
  try {
    const dto = body as CreateResenaDto;

    // Validaciones
    if (!dto.idReserva || !dto.idEmisor || !dto.calificacionGeneral || !dto.descripcion) {
      return NextResponse.json(
        { error: "Campos requeridos: id_reserva, id_emisor, calificacion_general, descripcion" },
        { status: 400 }
      );
    }

    const errCalGen = validarCalificacion(dto.calificacionGeneral, "calificacion_general");
    if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });

    const tiposDefinidos = [dto.idVehiculo, dto.idPropietario, dto.idAlquilador].filter(Boolean).length;
    if (tiposDefinidos > 1) {
      return NextResponse.json({ error: "Una reseña solo puede ser de un tipo: vehiculo, propietario o alquilador" }, { status: 400 });
    }

    const resena = await ResenaModel.createResena(dto);
    return NextResponse.json({ resena }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear reseña" }, { status: 500 });
  }
}

// ── PUT /api/resena/:id ──────────────────────────────────
export async function putResena(id: number, body: unknown) {
  try {
    const dto = body as UpdateResenaDto;

    const errCalGen = validarCalificacion(dto.calificacionGeneral, "calificacion_general");
    if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });

    const resena = await ResenaModel.updateResena(id, dto);
    if (!resena) return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    return NextResponse.json({ resena });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar reseña" }, { status: 500 });
  }
}

// ── DELETE /api/resena/:id ───────────────────────────────
export async function deleteResena(id: number) {
  try {
    await ResenaModel.deleteResena(id);
    return NextResponse.json({ message: "Reseña eliminada correctamente" });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar reseña" }, { status: 500 });
  }
}
