import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
        "id_respuesta": 1,
        "id_resena": 201,
        "id_autor": 74,
        "comentario": "Muchas gracias por tu reseña, Juan. Nos alegra saber que disfrutaste del viaje y cuidaste tan bien el coche.",
        "fecha_creacion": "2026-05-16T11:20:00.000Z",
        "resena": {
        "id_resena": 201,
        "descripcion": "Todo excelente, muy puntual y el auto una maravilla."
        }
    },
    {
        "id_respuesta": 2,
        "id_resena": 202,
        "id_autor": 85,
        "comentario": "Lamentamos mucho el inconveniente con el aire acondicionado. Ya lo ingresamos al taller para solucionarlo de inmediato.",
        "fecha_creacion": "2026-05-14T15:45:12.000Z",
        "resena": {
        "id_resena": 202,
        "descripcion": "Buen trato, pero el aire acondicionado no enfriaba bien y pasamos bastante calor."
        }
    },
    {
        "id_respuesta": 3,
        "id_resena": 203,
        "id_autor": 90,
        "comentario": "¡A vos por elegirnos! Te esperamos para tu próximo alquiler cuando gustes.",
        "fecha_creacion": "2026-05-17T08:10:25.000Z",
        "resena": {
        "id_resena": 203,
        "descripcion": "Súper recomendable, el dueño es muy atento."
        }
    },
    {
        "id_respuesta": 4,
        "id_resena": 204,
        "id_autor": 43,
        "comentario": "Hola Carlos, recordá que la tolerancia de espera era de 30 minutos y llegaste una hora tarde sin avisar previamente.",
        "fecha_creacion": "2026-05-15T19:30:00.000Z",
        "resena": {
        "id_resena": 204,
        "descripcion": "Me canceló el alquiler a último momento porque me demoré unos minutos en el tráfico de ingreso."
        }
    }
  ]

  return NextResponse.json({
    respuestas: data
  });
}