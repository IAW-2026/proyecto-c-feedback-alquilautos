import { EstadoModeracion } from "@prisma/client";

// ── Reseña completa con relaciones ──────────────────────
export interface ResenaCompleta {
  id: number;
  idReserva: number;
  idEmisor: string;
  calificacionGeneral: number;
  descripcion: string;
  fechaCreacion: Date;
  resenaVehiculo: {
    id: number;
    idVehiculo: number;
    calificacionLimpieza: number;
    calificacionEstado: number;
    calificacionComodidad: number;
  } | null;
  resenaPropietario: {
    id: number;
    idPropietario: number;
    calificacionComunicacion: number;
    calificacionPuntualidad: number;
  } | null;
  resenaAlquilador: {
    id: number;
    idAlquilador: number;
    calificacionComunicacion: number;
    calificacionPuntualidad: number;
    calificacionDevolucion: number;
  } | null;
  moderaciones: {
    id: number;
    idResena: number;
    idModerador: string;
    estado: EstadoModeracion;
    motivo: string | null;
    fechaCreacion: Date;
  }[];
  respuesta: {
    id: number;
    idResena: number;
    idAutor: string;
    comentario: string;
    fechaCreacion: Date;
  } | null;
}

// ── DTOs para creación ───────────────────────────────────
export interface CreateResenaDto {
  idReserva: number;
  idEmisor: string;
  calificacionGeneral: number;
  descripcion: string;
  // Tipo vehiculo
  idVehiculo?: number;
  calificacionLimpieza?: number;
  calificacionEstado?: number;
  calificacionComodidad?: number;
  // Tipo propietario
  idPropietario?: number;
  calificacionComunicacion?: number;
  calificacionPuntualidad?: number;
  // Tipo alquilador
  idAlquilador?: number;
  calificacionDevolucion?: number;
}

export interface UpdateResenaDto {
  calificacionGeneral?: number;
  descripcion?: string;
  calificacionLimpieza?: number;
  calificacionEstado?: number;
  calificacionComodidad?: number;
  calificacionComunicacion?: number;
  calificacionPuntualidad?: number;
  calificacionDevolucion?: number;
}

export interface CreateModeracionDto {
  idResena: number;
  idModerador: string;
  estado: EstadoModeracion;
  motivo: string;
}

export interface CreateRespuestaDto {
  idResena: number;
  idAutor: string;
  comentario: string;
}