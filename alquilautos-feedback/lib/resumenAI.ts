import * as ResenaController from "@/app/controllers/resenaController";
import { NextResponse } from "next/server";
import { TipoResena } from "@/lib/types";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

const ID_KEY: Record<TipoResena, string> = {
  vehiculo:    "id_vehiculo",
  propietario: "id_propietario",
  alquilador:  "id_alquilador",
};

async function fetchDetallesEntidad(tipo: TipoResena, id: number | string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
  let endpoint = "";
  if (tipo === "alquilador") endpoint = `/api/proxy/buyer/api/alquilador/${id}`;
  if (tipo === "propietario") endpoint = `/api/proxy/seller/api/propietario/${id}`;
  if (tipo === "vehiculo") endpoint = `/api/proxy/seller/api/vehiculo/${id}`;

  try {
    const clientHeaders = await headers(); 
    const cookie = clientHeaders.get("cookie") || "";

    const { getToken } = await auth();
    const token = await getToken();

    const headersToSend: Record<string, string> = {
      "Content-Type": "application/json",
      "Cookie": cookie,
    };

    if (token) {
      headersToSend["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method: "GET",
      headers: headersToSend,
    });
    
    if (!res.ok) {
      console.error(`Error en fetchDetallesEntidad. Status: ${res.status} para la entidad ${tipo}`);
      return `(ID: ${id})`; 
    }
    
    const data = await res.json();
    
    if (tipo === "vehiculo") {
      return data.marca && data.modelo ? `${data.marca} ${data.modelo}` : `(ID: ${id})`;
    } else {
      return data.nombre && data.apellido ? `${data.nombre} ${data.apellido}` : `(ID: ${id})`;
    }
  } catch (error) {
    console.error(`Error de red o parseo fetcheando detalles de ${tipo}:`, error);
    return `(ID: ${id})`; 
  }
}

async function fetchResenas(tipo: TipoResena, id: number | string) {
  switch (tipo) {
    case "vehiculo":    return ResenaController.getResenasDetalladasByVehiculo(String(id));
    case "propietario": return ResenaController.getResenasDetalladasByPropietario(String(id));
    case "alquilador":  return ResenaController.getResenasDetalladasByAlquilador(String(id));
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

  const [resp, nombreEntidad] = await Promise.all([
    fetchResenas(tipo, id),
    fetchDetallesEntidad(tipo, id)
  ]);

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

A continuación hay ${resenas.length} reseña${resenas.length !== 1 ? "s" : ""} sobre el ${tipo}: **${nombreEntidad}**:

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