import { db } from "@/app/lib/prisma";
import { EstadoModeracion } from "@prisma/client";
import { CreateModeracionDto } from "@/types";

const MODERACION_INCLUDE = {
  resena: {
    include: {
      resenaVehiculo: true,
      resenaPropietario: true,
      resenaAlquilador: true,
      respuesta: true,
    },
  },
};

// ── Todas las moderaciones ───────────────────────────────
export async function findAllModeraciones() {
  return db.moderacion.findMany({
    include: MODERACION_INCLUDE,
    orderBy: { fechaCreacion: "desc" },
  });
}

// ── Moderaciones pendientes ──────────────────────────────
export async function findModeracionesPendientes() {
  return db.moderacion.findMany({
    where: { estado: "PENDIENTE" },
    include: MODERACION_INCLUDE,
    orderBy: { fechaCreacion: "desc" },
  });
}

// ── Una moderacion por ID ────────────────────────────────
export async function findModeracionById(id: number) {
  return db.moderacion.findUnique({
    where: { id },
    include: MODERACION_INCLUDE,
  });
}

// ── Crear moderacion ─────────────────────────────────────
export async function createModeracion(dto: CreateModeracionDto) {
  return db.moderacion.create({
    data: {
      idResena: dto.idResena,
      idModerador: dto.idModerador,
      estado: dto.estado,
      motivo: dto.motivo ?? "",
    },
    include: MODERACION_INCLUDE,
  });
}

// ── Actualizar estado de moderacion ─────────────────────
export async function updateModeracionEstado(
  id: number,
  estado: EstadoModeracion,
  motivo?: string
) {
  return db.moderacion.update({
    where: { id },
    data: { estado, motivo: motivo },
    include: MODERACION_INCLUDE,
  });
}

// ── Eliminar moderacion ──────────────────────────────────
export async function deleteModeracion(id: number) {
  return db.moderacion.delete({ where: { id } });
}
