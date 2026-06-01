import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import * as ResenaController from "@/app/controllers/resenaController";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return ResenaController.getResenaById(Number(id));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  const body = await req.json();
  return ResenaController.putResena(Number(id), body);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return ResenaController.deleteResena(Number(id));
}
