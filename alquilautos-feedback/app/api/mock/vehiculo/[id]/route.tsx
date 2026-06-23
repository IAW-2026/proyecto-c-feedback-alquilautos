import { NextResponse } from "next/server";
import { getMockVehiculo } from "@/lib/mocks";

// GET /api/mock/vehiculo/:id
export async function GET( _: Request, { params }: { params: Promise<{ id: string }> } ) {
  const vehiculo = getMockVehiculo((await params).id);
  
  if (!vehiculo) {
    return NextResponse.json(
      { error: "Vehiculo no encontrado" }, 
      { status: 404 }
    );
  }
  
  return NextResponse.json(vehiculo);
}