import { EstadoModeracion } from "@prisma/client";

export type EstadoMod = "Pendiente" | "Aprobada" | "Rechazada";
export type TipoResena = "vehiculo" | "propietario" | "alquilador";

export enum ModalMode {
  VIEW = "view",
  EDIT = "edit",
  CREATE = "create",
}

export interface ModeracionItem {
  id: number;
  idModerador: string;
  estado: EstadoMod;
  motivo: string | null;
  fechaCreacion: string;
}

export interface RespuestaItem {
  id: number;
  idAutor: string;
  comentario: string;
  fechaCreacion: string;
}

export interface ResenaCompleta {
  id: number;
  idReserva: number;
  idEmisor: string;
  calificacionGeneral: number;
  descripcion: string;
  fechaCreacion: string;
  resenaVehiculo: {
    idVehiculo: number;
    calificacionLimpieza: number;
    calificacionEstado: number;
    calificacionComodidad: number;
  } | null;
  resenaPropietario: {
    idPropietario: string;
    calificacionComunicacion: number;
    calificacionPuntualidad: number;
  } | null;
  resenaAlquilador: {
    idAlquilador: string;
    calificacionComunicacion: number;
    calificacionPuntualidad: number;
    calificacionDevolucion: number;
  } | null;
  moderaciones: ModeracionItem[];
  respuesta: RespuestaItem | null;
}

export interface ModeracionCompleta {
  id: number;
  idResena: number;
  idModerador: string;
  estado: EstadoModeracion;
  motivo: string | null;
  fechaCreacion: string;
  resena: ResenaCompleta;
}

export interface RespuestaCompleta {
  id: number;
  idResena: number;
  idAutor: string;
  comentario: string;
  fechaCreacion: string;
  resena: ResenaCompleta;
}

// ── Helpers ──────────────────────────────────────────────
export function getTipo(r: ResenaCompleta): TipoResena {
  if (r.resenaVehiculo) return "vehiculo";
  if (r.resenaPropietario) return "propietario";
  return "alquilador";
}

export function getReceptorId(r: ResenaCompleta): number | string {
  if (r.resenaVehiculo) return r.resenaVehiculo.idVehiculo;
  if (r.resenaPropietario) return r.resenaPropietario.idPropietario;
  return r.resenaAlquilador?.idAlquilador ?? "";
}

export function getLastEstado(r: ResenaCompleta): string {
  return r.moderaciones[0]?.estado ?? "Sin moderar";
}

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-AR");
}

export function shortenId(id: number | string, start = 8, end = 6) {
  const s = String(id);
  if (s.length <= start + end + 1) return s;
  return `${s.slice(0, start)}…${s.slice(-end)}`;
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
  idPropietario?: string;
  calificacionComunicacion?: number;
  calificacionPuntualidad?: number;
  // Tipo alquilador
  idAlquilador?: string;
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