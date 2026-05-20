import { NextResponse } from "next/server";
import { getAllMockAlquiladores } from "@/lib/mocks";

// GET /api/mock/alquilador
export async function GET() {
  return NextResponse.json({ 
    alquiladores: getAllMockAlquiladores() 
  });
}