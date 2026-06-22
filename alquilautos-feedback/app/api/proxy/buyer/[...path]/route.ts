import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.BUYER_API_URL;

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BASE}/${path.join("/")}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}