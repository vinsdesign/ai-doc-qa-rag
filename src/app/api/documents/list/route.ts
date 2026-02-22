import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ documents });
}
