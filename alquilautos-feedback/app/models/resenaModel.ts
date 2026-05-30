import { db } from "@/lib/prisma";
import { CreateResenaDto, UpdateResenaDto } from "@/lib/types";

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
      moderaciones: {
        create: [
          {
            idModerador: "SYSTEM",
            estado: "PENDIENTE",
            motivo: "Reseña creada"
          }
        ],
      },
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
    await tx.resena.update({
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

// ── Reseñas de un alquilador ─────────────────────────────
export async function findResenasByAlquilador(idAlquilador: number) {
  return db.resena.findMany({
    where: { resenaAlquilador: { is: { idAlquilador } } },
    include: RESENA_INCLUDE,
    orderBy: { fechaCreacion: "desc" },
  });
}

// ── Reseñas de un propietario ────────────────────────────
export async function findResenasByPropietario(idPropietario: number) {
  return db.resena.findMany({
    where: { resenaPropietario: { is: { idPropietario } } },
    include: RESENA_INCLUDE,
    orderBy: { fechaCreacion: "desc" },
  });
}

// ── Reseñas de un vehículo ───────────────────────────────
export async function findResenasByVehiculo(idVehiculo: number) {
  return db.resena.findMany({
    where: { resenaVehiculo: { is: { idVehiculo } } },
    include: RESENA_INCLUDE,
    orderBy: { fechaCreacion: "desc" },
  });
}

export async function findResenaAlquiladorByReserva(idReserva: number) {
  return db.resena.findFirst({
    where: { idReserva, resenaAlquilador: { is: {} }},
    include: RESENA_INCLUDE,
  })
}

export async function findResenaPropietarioByReserva(idReserva: number) {
  return db.resena.findFirst({
    where: { idReserva, resenaPropietario: { is: {} }},
    include: RESENA_INCLUDE,
  })
}

export async function findResenaVehiculoByReserva(idReserva: number) {
  return db.resena.findFirst({
    where: { idReserva, resenaVehiculo: { is: {} }},
    include: RESENA_INCLUDE,
  })
}

// ── Promedio de calificacion de alquilador ──────────────
export async function calcPromedioAlquilador(idAlquilador: number) {
  const result = await db.resena.aggregate({
    where: { resenaAlquilador: { is: { idAlquilador } } },
    _avg: { calificacionGeneral: true },
    _count: { _all: true },
  });
  return {
    calificacion_promedio: result._avg.calificacionGeneral ?? 0,
    cantidad_resenas: result._count._all ?? 0,
  };
}

// ── Promedio de calificacion de propietario ─────────────
export async function calcPromedioPropietario(idPropietario: number) {
  const result = await db.resena.aggregate({
    where: { resenaPropietario: { is: { idPropietario } } },
    _avg: { calificacionGeneral: true },
    _count: { _all: true },
  });
  return {
    calificacion_promedio: result._avg.calificacionGeneral ?? 0,
    cantidad_resenas: result._count._all ?? 0,
  };
}

// ── Promedio de calificacion de vehículo ────────────────
export async function calcPromedioVehiculo(idVehiculo: number) {
  const result = await db.resena.aggregate({
    where: { resenaVehiculo: { is: { idVehiculo } } },
    _avg: { calificacionGeneral: true },
    _count: { _all: true },
  });
  return {
    calificacion_promedio: result._avg.calificacionGeneral ?? 0,
    cantidad_resenas: result._count._all ?? 0,
  };
}