import { NextResponse } from "next/server";
import { getMockPropietario } from "@/lib/mocks";

// GET /api/mock/propietario/:id
export async function GET( _: Request, { params }: { params: Promise<{ id: string }> } ) {
  const propietario = getMockPropietario((await params).id);
  
  if (!propietario) {
    return NextResponse.json(
      { error: "Propietario no encontrado" }, 
      { status: 404 }
    );
  }
  
  return NextResponse.json(propietario);
}