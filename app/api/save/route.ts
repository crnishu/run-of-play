import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const saveSchema = z.object({
  sport: z.string().max(32).default("soccer"),
  data: z.record(z.string(), z.unknown()),
});

// GET /api/save?sport=soccer
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sport = req.nextUrl.searchParams.get("sport") ?? "soccer";

  const save = await db.gameSave.findUnique({
    where: { userId_sport: { userId: session.user.id, sport } },
  });

  if (!save) return NextResponse.json({ save: null });
  return NextResponse.json({ save: save.data });
}

// POST /api/save
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (rateLimit(`save:${session.user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid save data" }, { status: 400 });
  }

  const { sport, data } = parsed.data;
  const jsonData = data as Prisma.InputJsonValue;

  await db.gameSave.upsert({
    where: { userId_sport: { userId: session.user.id, sport } },
    create: { userId: session.user.id, sport, data: jsonData },
    update: { data: jsonData },
  });

  return NextResponse.json({ ok: true });
}
