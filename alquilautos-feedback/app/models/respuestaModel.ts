import { db } from "@/app/lib/prisma";
import { CreateRespuestaDto } from "@/types";

// ── Todas las respuestas ─────────────────────────────────
export async function findAllRespuestas() {
  return db.respuesta.findMany({
    include: { resena: true },
    orderBy: { fechaCreacion: "desc" },
  });
}

// ── Respuesta por ID ─────────────────────────────────────
export async function findRespuestaById(id: number) {
  return db.respuesta.findUnique({
    where: { id },
    include: { resena: true },
  });
}

// ── Respuesta de una reseña ──────────────────────────────
export async function findRespuestaByResena(idResena: number) {
  return db.respuesta.findUnique({
    where: { idResena },
    include: { resena: true },
  });
}

// ── Crear respuesta ──────────────────────────────────────
export async function createRespuesta(dto: CreateRespuestaDto) {
  return db.respuesta.create({
    data: {
      idResena: dto.idResena,
      idAutor: dto.idAutor,
      comentario: dto.comentario,
    },
    include: { resena: true },
  });
}

// ── Actualizar comentario ────────────────────────────────
export async function updateRespuesta(id: number, comentario: string) {
  return db.respuesta.update({
    where: { id },
    data: { comentario },
    include: { resena: true },
  });
}

// ── Eliminar respuesta ───────────────────────────────────
export async function deleteRespuesta(id: number) {
  return db.respuesta.delete({ where: { id } });
}
