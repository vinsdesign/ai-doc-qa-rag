import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF allowed" }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: "private", // ✅ store kamu private
    addRandomSuffix: true,
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType ?? file.type,
    sizeBytes: file.size,
  });
}
