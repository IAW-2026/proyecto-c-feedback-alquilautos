import { NextResponse } from "next/server";
import { getAllMockReservas } from "@/lib/mocks";

// GET /api/mock/reserva
export async function GET() {
  return NextResponse.json({ 
    reservas: getAllMockReservas() 
  });
}