import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import * as ModeracionController from "@/app/controllers/moderacionController";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return ModeracionController.getModeracionById(Number(id));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  return ModeracionController.patchModeracionEstado(Number(id), body);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return ModeracionController.deleteModeracion(Number(id));
}
