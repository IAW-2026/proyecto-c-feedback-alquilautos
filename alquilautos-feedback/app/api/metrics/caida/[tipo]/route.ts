import { NextRequest } from "next/server";
import { getCaidaHandler } from "@/app/controllers/metricsController";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { tipo } = await params;
  return getCaidaHandler(tipo, req.nextUrl.searchParams);
}
