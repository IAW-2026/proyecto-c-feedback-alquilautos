import { NextRequest } from "next/server";
import { getEmisoresRecurrentesHandler } from "@/app/controllers/metricsController";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  return getEmisoresRecurrentesHandler(req.nextUrl.searchParams);
}
