import { db } from "@/app/lib/prisma";

export async function GET() {
  const cantidad = await db.resena.count();

  return Response.json({
    ok: true,
    cantidad,
  });
}