import { NextResponse } from "next/server";

export async function GET() {
  const data = [
    {
      "id": 1,
      "idReserva": 43,
      "idEmisor": "24",
      "calificacionGeneral": 5,
      "descripcion": "Todo perfecto!",
      "fechaCreacion": "2026-05-17T06:01:02.000Z",
      "resenaVehiculo": null,
      "resenaPropietario": {
        "id": 1,
        "idPropietario": 74,
        "calificacionComunicacion": 5,
        "calificacionPuntualidad": 5
      },
      "resenaAlquilador": null,
      "moderaciones": [
        {
          "id": 1,
          "idResena": 1,
          "idModerador": "22",
          "estado": "PENDIENTE",
          "motivo": "",
          "fechaCreacion": "2026-05-17T06:01:02.000Z"
        }
      ],
      "respuesta": null
    },
    {
      "id": 2,
      "idReserva": 33,
      "idEmisor": "24",
      "calificacionGeneral": 4,
      "descripcion": "Casi casi",
      "fechaCreacion": "2026-05-11T02:02:02.000Z",
      "resenaVehiculo": {
        "id": 2,
        "idVehiculo": 99,
        "calificacionLimpieza": 4,
        "calificacionEstado": 3,
        "calificacionComodidad": 5
      },
      "resenaPropietario": null,
      "resenaAlquilador": null,
      "moderaciones": [
        {
          "id": 2,
          "idResena": 2,
          "idModerador": "10",
          "estado": "APROBADA",
          "motivo": "",
          "fechaCreacion": "2026-05-11T02:02:02.000Z"
        }
      ],
      "respuesta": null
    }
  ];

  return NextResponse.json({
    resenas: data
  });
}