import { NextResponse } from "next/server";
import { getMockAlquilador } from "@/lib/mocks";

// GET /api/mock/alquilador/:id
export async function GET( _: Request, { params }: { params: Promise<{ id: string }> } ) {
  const alquilador = getMockAlquilador((await params).id);
  
  if (!alquilador) {
    return NextResponse.json(
      { error: "Alquilador no encontrado" }, 
      { status: 404 }
    );
  }
  
  return NextResponse.json(alquilador);
}