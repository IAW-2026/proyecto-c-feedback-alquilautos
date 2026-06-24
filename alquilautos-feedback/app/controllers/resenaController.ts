import * as ResenaModel from "@/app/models/resenaModel";
import { CreateResenaDto, UpdateResenaDto } from "@/lib/types";
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

    console.log(dto);
    console.log("----------");
    console.log(body);
    console.log("---------------------------------");

    // Validaciones
    if (!dto.idReserva || !dto.idEmisor || !dto.calificacionGeneral || !dto.descripcion) {
      return NextResponse.json(
        { error: "Campos requeridos: id_reserva, id_emisor, calificacion_general, descripcion" },
        { status: 400 }
      );
    }

    const errCalGen = validarCalificacion(dto.calificacionGeneral, "calificacion_general");
    if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });

    if(dto.calificacionComodidad){
      const errCalGen = validarCalificacion(dto.calificacionComodidad, "calificacion_comodidad");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionComunicacion){
      const errCalGen = validarCalificacion(dto.calificacionComunicacion, "calificacion_comunicacion");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionDevolucion){
      const errCalGen = validarCalificacion(dto.calificacionDevolucion, "calificacion_devolucion");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionEstado){
      const errCalGen = validarCalificacion(dto.calificacionEstado, "calificacion_estado");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionLimpieza){
      const errCalGen = validarCalificacion(dto.calificacionLimpieza, "calificacion_limpieza");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionPuntualidad){
      const errCalGen = validarCalificacion(dto.calificacionPuntualidad, "calificacion_puntualidad");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

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

    if(dto.calificacionComodidad){
      const errCalGen = validarCalificacion(dto.calificacionComodidad, "calificacion_comodidad");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionComunicacion){
      const errCalGen = validarCalificacion(dto.calificacionComunicacion, "calificacion_comunicacion");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionDevolucion){
      const errCalGen = validarCalificacion(dto.calificacionDevolucion, "calificacion_devolucion");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionEstado){
      const errCalGen = validarCalificacion(dto.calificacionEstado, "calificacion_estado");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionLimpieza){
      const errCalGen = validarCalificacion(dto.calificacionLimpieza, "calificacion_limpieza");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

    if(dto.calificacionPuntualidad){
      const errCalGen = validarCalificacion(dto.calificacionPuntualidad, "calificacion_puntualidad");
      if (errCalGen) return NextResponse.json({ error: errCalGen }, { status: 400 });
    }

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

// ── GET /api/resena/alquilador/:id ───────────────────────
export async function getResenasByAlquilador(id: string) {
  try {
    const data = await ResenaModel.findResenasByAlquilador(id);

    const resenas = data.map(r => ({
      id_resena: r.id,
      id_reserva: r.idReserva,
      id_emisor: r.idEmisor,
      calificacion_general: r.calificacionGeneral,
      descripcion: r.descripcion,
      fecha_creacion: r.fechaCreacion,
      calificacion_comunicacion: r.resenaAlquilador?.calificacionComunicacion,
      calificacion_puntualidad: r.resenaAlquilador?.calificacionPuntualidad,
      calificacion_devolucion: r.resenaAlquilador?.calificacionDevolucion,
    }));

    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json( { error: "Error al obtener reseñas del alquilador" }, { status: 500 } );
  }
}

// ── GET /api/resena/alquilador/:id/detallada ─────────────
export async function getResenasDetalladasByAlquilador(id: string) {
  try {
    const resenas = await ResenaModel.findResenasDetalladasByAlquilador(id);
    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json( { error: "Error al obtener reseñas detalladas del alquilador" }, { status: 500 } );
  }
}

// ── GET /api/resena/propietario/:id ─────────────────────
export async function getResenasByPropietario(id: string) {
  try {
    const data = await ResenaModel.findResenasByPropietario(id);

    const resenas = data.map(r => ({
      id_resena: r.id,
      id_reserva: r.idReserva,
      id_emisor: r.idEmisor,
      calificacion_general: r.calificacionGeneral,
      descripcion: r.descripcion,
      fecha_creacion: r.fechaCreacion,
      calificacion_comunicacion: r.resenaPropietario?.calificacionComunicacion,
      calificacion_puntualidad: r.resenaPropietario?.calificacionPuntualidad,
    }));

    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseñas del propietario" }, { status: 500 });
  }
}

// ── GET /api/resena/propietario/:id/detallada ────────────
export async function getResenasDetalladasByPropietario(id: string) {
  try {
    const resenas = await ResenaModel.findResenasDetalladasByPropietario(id);
    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json( { error: "Error al obtener reseñas detalladas del propietario" }, { status: 500 } );
  }
}

// ── GET /api/resena/vehiculo/:id ─────────────────────────
export async function getResenasByVehiculo(id: string) {
  try {
    const data = await ResenaModel.findResenasByVehiculo(id);

    const resenas = data.map(r => ({
      id_resena: r.id,
      id_reserva: r.idReserva,
      id_emisor: r.idEmisor,
      calificacion_general: r.calificacionGeneral,
      descripcion: r.descripcion,
      fecha_creacion: r.fechaCreacion,
      calificacion_comodidad: r.resenaVehiculo?.calificacionComodidad,
      calificacion_estado: r.resenaVehiculo?.calificacionEstado,
      calificacion_limpieza: r.resenaVehiculo?.calificacionLimpieza,
    }));

    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseñas del vehículo" }, { status: 500 });
  }
}

// ── GET /api/resena/vehiculo/:id/detallada ───────────────
export async function getResenasDetalladasByVehiculo(id: string) {
  try {
    const resenas = await ResenaModel.findResenasDetalladasByVehiculo(id);
    return NextResponse.json({ resenas });
  } catch (e) {
    console.error(e);
    return NextResponse.json( { error: "Error al obtener reseñas detalladas del vehículo" }, { status: 500 } );
  }
}

export async function getResenaAlquiladorByReserva(id: string){
  try {
    const resena = await ResenaModel.findResenaAlquiladorByReserva(id);
    return NextResponse.json({ resena });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseña del alquilador" }, { status: 500 });
  }
}

export async function getResenaPropietarioByReserva(id: string){
  try {
    const resena = await ResenaModel.findResenaPropietarioByReserva(id);
    return NextResponse.json({ resena });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseña del propietario" }, { status: 500 });
  }
}

export async function getResenaVehiculoByReserva(id: string){
  try {
    const resena = await ResenaModel.findResenaVehiculoByReserva(id);
    return NextResponse.json({ resena });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al obtener reseña del vehículo" }, { status: 500 });
  }
}

// ── GET /api/resena/alquilador/:id/promedio ──────────────
export async function getPromedioAlquilador(id: string) {
  try {
    const result = await ResenaModel.calcPromedioAlquilador(id);
    return NextResponse.json({ id_alquilador: id, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular promedio" }, { status: 500 });
  }
}

// ── GET /api/resena/propietario/:id/promedio ─────────────
export async function getPromedioPropietario(id: string) {
  try {
    const result = await ResenaModel.calcPromedioPropietario(id);
    return NextResponse.json({ id_propietario: id, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular promedio" }, { status: 500 });
  }
}

// ── GET /api/resena/vehiculo/:id/promedio ────────────────
export async function getPromedioVehiculo(id: string) {
  try {
    const result = await ResenaModel.calcPromedioVehiculo(id);
    return NextResponse.json({ id_vehiculo: id, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al calcular promedio" }, { status: 500 });
  }
}