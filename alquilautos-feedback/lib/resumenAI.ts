import * as ResenaController from "@/app/controllers/resenaController";
import { NextResponse } from "next/server";
import { TipoResena } from "@/lib/types";

const ID_KEY: Record<TipoResena, string> = {
  vehiculo:    "id_vehiculo",
  propietario: "id_propietario",
  alquilador:  "id_alquilador",
};

async function fetchResenas(tipo: TipoResena, id: number | string) {
  switch (tipo) {
    case "vehiculo":    return ResenaController.getResenasByVehiculo(Number(id));
    case "propietario": return ResenaController.getResenasByPropietario(String(id));
    case "alquilador":  return ResenaController.getResenasByAlquilador(String(id));
  }
}

async function extractPayload(resp: any) {
  if (!resp) return null;
  if (typeof resp.json === "function") {
    try { return await resp.json(); } catch { return (resp as any).body ?? null; }
  }
  return resp;
}

export async function generarResumenResponse(tipo: TipoResena, id: number | string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY no configurada en variables de entorno." },
      { status: 500 }
    );
  }

  const resp = await fetchResenas(tipo, id);
  const payload: any = await extractPayload(resp);
  const todasLasResenas: any[] = payload?.resenas ?? payload ?? [];

  const resenas = todasLasResenas.filter(r => r.moderaciones?.[0]?.estado === "APROBADA");

  if (!resenas || resenas.length === 0) {
    return NextResponse.json({
      [ID_KEY[tipo]]: id,
      resumen: `No hay suficientes reseñas aprobadas para generar un resumen de este ${tipo}.`,
    });
  }

  const listaResenas = resenas
    .map((r, i) => `${i + 1}. (${r.calificacionGeneral}/5) "${r.descripcion}"`)
    .join("\n");

  const prompt = `Sos un asistente que analiza reseñas de un sistema de alquiler de autos argentino llamado AlquilAutos.

A continuación hay ${resenas.length} reseña${resenas.length !== 1 ? "s" : ""} sobre un ${tipo} (ID: ${id}):

${listaResenas}

Generá un resumen conciso en español (4-6 oraciones) que capture los puntos principales destacados por los usuarios, tanto positivos como negativos. Mencioná la calificación promedio. Escribí en un tono objetivo y profesional, sin dirigirte a nadie en particular.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.3
      }
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    const status = response.status;

    if (status === 429) {
      return NextResponse.json(
        { 
          error: "Límite de uso excedido", 
          resumen: "La IA está procesando muchas solicitudes en este momento. Por favor, intenta de nuevo en unos minutos." 
        },
        { status: 429 }
      );
    }

    // Sin saldo o API key erronea (403 / 401)
    if (status === 403 || status === 401) {
      return NextResponse.json(
        { error: "Servicio de IA temporalmente no disponible." },
        { status: 503 }
      );
    }

    if (status === 503) {
      return NextResponse.json(
        { error: "El modelo está saturado. Intente de nuevo en unos minutos." },
        { status: 503 }
      );
    }

    throw new Error(err.error?.message ?? "Error al llamar a la API de Google Gemini");
  }

  const data = await response.json();
  
  const resumen = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No se pudo generar el resumen.";

  return NextResponse.json({ [ID_KEY[tipo]]: id, resumen });
}