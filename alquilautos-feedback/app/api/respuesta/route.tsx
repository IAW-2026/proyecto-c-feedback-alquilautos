import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import * as RespuestaController from "@/app/controllers/respuestaController";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return RespuestaController.getAllRespuestas();
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  return RespuestaController.postRespuesta(body);
}
