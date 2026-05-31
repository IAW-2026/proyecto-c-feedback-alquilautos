import { NextRequest } from "next/server";
import { generarResumenResponse } from "@/lib/resumenAI";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return generarResumenResponse("propietario", Number(id));
  } catch (e) {
    const { NextResponse } = await import("next/server");
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}