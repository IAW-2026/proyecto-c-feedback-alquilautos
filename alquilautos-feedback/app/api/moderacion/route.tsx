import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      "id_moderacion": 1,
      "id_resena": 101,
      "id_moderador": 12,
      "estado": "Pendiente",
      "motivo": null,
      "fecha_creacion": "2026-05-17T14:30:00.000Z",
      "resena": {
        "id_resena": 101,
        "descripcion": "El vehículo no estaba del todo limpio al momento de la entrega, encontré papeles en los asientos traseros.",
        "calificacion_general": 2
      }
    },
    {
      "id_moderacion": 2,
      "id_resena": 102,
      "id_moderador": 15,
      "estado": "Aprobada",
      "motivo": "",
      "fecha_creacion": "2026-05-16T09:15:32.000Z",
      "resena": {
        "id_resena": 102,
        "descripcion": "Excelente atención por parte del propietario. El auto estaba impecable y andaba bárbaro.",
        "calificacion_general": 5
      }
    },
    {
      "id_moderacion": 3,
      "id_resena": 103,
      "id_moderador": 12,
      "estado": "Rechazada",
      "motivo": "Contiene lenguaje inapropiado e insultos directos.",
      "fecha_creacion": "2026-05-15T18:22:10.000Z",
      "resena": {
        "id_resena": 103,
        "descripcion": "Unos totales estafadores de m..., me cobraron un recargo que no correspondía. No les alquilen.",
        "calificacion_general": 1
      }
    },
    {
      "id_moderacion": 4,
      "id_resena": 104,
      "id_moderador": 20,
      "estado": "Pendiente",
      "motivo": null,
      "fecha_creacion": "2026-05-17T21:05:14.000Z",
      "resena": {
        "id_resena": 104,
        "descripcion": "Cumplió con todo lo pactado, el viaje fue muy cómodo y la comunicación muy fluida.",
        "calificacion_general": 4
      }
    }
  ]

  return NextResponse.json({
    moderaciones: data
  });
}