import { snakeToCamel } from "@/lib/snakeToCamel";
import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SELLER_API_URL;

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BASE}/${path.join("/")}`;

  const res = await fetch(url, {
    headers: {
      authorization: req.headers.get("authorization") ?? "",
      cookie: req.headers.get("cookie") ?? "",
    },
  });

  const data = await res.json();
  return NextResponse.json(snakeToCamel(data.data), { status: res.status });
}