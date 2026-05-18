import { db } from "@/app/lib/prisma";
import { CreateResenaDto, UpdateResenaDto } from "@/types";

// Incluir todas las relaciones en las consultas
const RESENA_INCLUDE = {
  resenaVehiculo: true,
  resenaPropietario: true,
  resenaAlquilador: true,
  moderaciones: { orderBy: { fechaCreacion: "desc" as const } },
  respuesta: true,
};

// ── Obtener todas las reseñas ────────────────────────────
export async function findAllResenas() {
  return db.resena.findMany({
    include: RESENA_INCLUDE,
    orderBy: { fechaCreacion: "desc" },
  });
}

// ── Obtener una reseña por ID ────────────────────────────
export async function findResenaById(id: number) {
  return db.resena.findUnique({
    where: { id },
    include: RESENA_INCLUDE,
  });
}

// ── Crear reseña ─────────────────────────────────────────
export async function createResena(dto: CreateResenaDto) {
  const {
    idReserva, idEmisor, calificacionGeneral, descripcion,
    // vehiculo
    idVehiculo, calificacionLimpieza, calificacionEstado, calificacionComodidad,
    // propietario
    idPropietario, calificacionComunicacion, calificacionPuntualidad,
    // alquilador
    idAlquilador, calificacionDevolucion,
  } = dto;

  return db.resena.create({
    data: {
      idReserva,
      idEmisor,
      calificacionGeneral,
      descripcion,
      ...(idVehiculo !== undefined && {
        resenaVehiculo: {
          create: {
            idVehiculo: idVehiculo!,
            calificacionLimpieza: calificacionLimpieza ?? 3,
            calificacionEstado: calificacionEstado ?? 3,
            calificacionComodidad: calificacionComodidad ?? 3,
          },
        },
      }),
      ...(idPropietario !== undefined && {
        resenaPropietario: {
          create: {
            idPropietario: idPropietario!,
            calificacionComunicacion: calificacionComunicacion ?? 3,
            calificacionPuntualidad: calificacionPuntualidad ?? 3,
          },
        },
      }),
      ...(idAlquilador !== undefined && {
        resenaAlquilador: {
          create: {
            idAlquilador: idAlquilador!,
            calificacionComunicacion: calificacionComunicacion ?? 3,
            calificacionPuntualidad: calificacionPuntualidad ?? 3,
            calificacionDevolucion: calificacionDevolucion ?? 3,
          },
        },
      }),
    },
    include: RESENA_INCLUDE,
  });
}

// ── Actualizar reseña ────────────────────────────────────
export async function updateResena(id: number, dto: UpdateResenaDto) {
  const resena = await db.resena.findUnique({
    where: { id },
    include: { resenaVehiculo: true, resenaPropietario: true, resenaAlquilador: true },
  });
  if (!resena) return null;

  return db.$transaction(async (tx) => {
    const updated = await tx.resena.update({
      where: { id },
      data: {
        ...(dto.calificacionGeneral !== undefined && { calificacionGeneral: dto.calificacionGeneral }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      },
    });

    if (resena.resenaVehiculo) {
      await tx.resenaVehiculo.update({
        where: { id },
        data: {
          ...(dto.calificacionLimpieza !== undefined && { calificacionLimpieza: dto.calificacionLimpieza }),
          ...(dto.calificacionEstado !== undefined && { calificacionEstado: dto.calificacionEstado }),
          ...(dto.calificacionComodidad !== undefined && { calificacionComodidad: dto.calificacionComodidad }),
        },
      });
    }

    if (resena.resenaPropietario) {
      await tx.resenaPropietario.update({
        where: { id },
        data: {
          ...(dto.calificacionComunicacion !== undefined && { calificacionComunicacion: dto.calificacionComunicacion }),
          ...(dto.calificacionPuntualidad !== undefined && { calificacionPuntualidad: dto.calificacionPuntualidad }),
        },
      });
    }

    if (resena.resenaAlquilador) {
      await tx.resenaAlquilador.update({
        where: { id },
        data: {
          ...(dto.calificacionComunicacion !== undefined && { calificacionComunicacion: dto.calificacionComunicacion }),
          ...(dto.calificacionPuntualidad !== undefined && { calificacionPuntualidad: dto.calificacionPuntualidad }),
          ...(dto.calificacionDevolucion !== undefined && { calificacionDevolucion: dto.calificacionDevolucion }),
        },
      });
    }

    return tx.resena.findUnique({ where: { id }, include: RESENA_INCLUDE });
  });
}

// ── Eliminar reseña ──────────────────────────────────────
export async function deleteResena(id: number) {
  return db.resena.delete({ where: { id } });
}
