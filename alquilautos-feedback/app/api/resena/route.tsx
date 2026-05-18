import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import * as ResenaController from "@/app/controllers/resenaController";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return ResenaController.getAllResenas();
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const body = await req.json();
  return ResenaController.postResena(body);
}
