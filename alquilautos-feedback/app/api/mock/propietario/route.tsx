import { NextResponse } from "next/server";
import { getAllMockPropietarios } from "@/lib/mocks";

// GET /api/mock/propietario
export async function GET() {
  return NextResponse.json({ 
    propietarios: getAllMockPropietarios() 
  });
}