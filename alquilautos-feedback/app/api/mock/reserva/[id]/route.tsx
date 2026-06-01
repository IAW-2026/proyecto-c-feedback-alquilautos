import { NextResponse } from "next/server";
import { getMockReserva } from "@/lib/mocks";

// GET /api/mock/reserva/:id
export async function GET( _: Request, { params }: { params: Promise<{ id: string }> } ) {
  const reserva = getMockReserva(Number((await params).id));
  
  if (!reserva) {
    return NextResponse.json(
      { error: "Reserva no encontrada" }, 
      { status: 404 }
    );
  }
  
  return NextResponse.json(reserva);
}