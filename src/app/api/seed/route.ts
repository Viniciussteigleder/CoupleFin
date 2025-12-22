import { NextResponse } from "next/server";
import { buildSeed } from "@/lib/seed";
import { withLatency } from "@/lib/mockLatency";

export async function GET() {
  const data = await withLatency(() => buildSeed(), 500);
  return NextResponse.json({ ok: true, data });
}
