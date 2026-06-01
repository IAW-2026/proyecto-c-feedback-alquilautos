import { NextRequest } from "next/server";
import { getPromedioVehiculo } from "@/app/controllers/resenaController";
import { auth } from "@clerk/nextjs/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { id } = await params;
  return getPromedioVehiculo(Number(id));
}