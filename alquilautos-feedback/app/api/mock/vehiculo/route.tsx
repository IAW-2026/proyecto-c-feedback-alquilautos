import { NextResponse } from "next/server";
import { getAllMockVehiculos } from "@/lib/mocks";

// GET /api/mock/vehiculo
export async function GET() {
  return NextResponse.json({ 
    vehiculos: getAllMockVehiculos() 
  });
}