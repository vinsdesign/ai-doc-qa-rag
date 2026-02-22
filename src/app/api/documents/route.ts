import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, fileUrl, blobPathname } = body ?? {};

    if (!title || !fileUrl || !blobPathname) {
      return NextResponse.json(
        { error: "title, fileUrl, blobPathname are required" },
        { status: 400 },
      );
    }

    const doc = await prisma.document.create({
      data: { title, fileUrl, blobPathname, status: "UPLOADED" },
    });

    return NextResponse.json({ document: doc });
  } catch (err: unknown) {
    console.error("POST /api/documents error:", err);

    const message =
      err instanceof Error ? err.message : "Internal Server Error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
