import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const MAX_CAREERS = 100;

const createSchema = z.object({
  sport: z.string().max(32).default("soccer"),
  name: z.string().min(1).max(40),
  summary: z.record(z.string(), z.unknown()),
  data: z.record(z.string(), z.unknown()),
});

// GET /api/careers — list the signed-in user's saved careers (summaries only)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const careers = await db.savedCareer.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, sport: true, summary: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ careers });
}

// POST /api/careers — archive a completed career
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (rateLimit(`careers:${session.user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid career data" }, { status: 400 });
  }

  const count = await db.savedCareer.count({ where: { userId: session.user.id } });
  if (count >= MAX_CAREERS) {
    return NextResponse.json(
      { error: `You can save up to ${MAX_CAREERS} careers. Delete some to make room.` },
      { status: 409 }
    );
  }

  const { sport, name, summary, data } = parsed.data;

  const created = await db.savedCareer.create({
    data: {
      userId: session.user.id,
      sport,
      name,
      summary: summary as Prisma.InputJsonValue,
      data: data as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
