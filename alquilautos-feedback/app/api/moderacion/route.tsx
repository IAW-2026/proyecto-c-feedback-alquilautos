import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import * as ModeracionController from "@/app/controllers/moderacionController";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const pendientes = req.nextUrl.searchParams.get("pendientes") === "true";
  return ModeracionController.getAllModeraciones(pendientes);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  return ModeracionController.postModeracion(body, userId);
}
