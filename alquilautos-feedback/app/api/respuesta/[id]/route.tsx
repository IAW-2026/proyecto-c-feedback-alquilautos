import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import * as RespuestaController from "@/app/controllers/respuestaController";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return RespuestaController.getRespuestaById(Number(id));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  return RespuestaController.putRespuesta(Number(id), body);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return RespuestaController.deleteRespuesta(Number(id));
}
