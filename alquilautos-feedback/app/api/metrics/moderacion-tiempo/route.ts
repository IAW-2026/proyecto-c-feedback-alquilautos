import { getTiempoModeracionHandler } from "@/app/controllers/metricsController";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return getTiempoModeracionHandler();
}
