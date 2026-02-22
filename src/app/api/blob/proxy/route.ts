import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pathname = searchParams.get("pathname");

    if (!pathname) {
      return NextResponse.json({ error: "Missing pathname" }, { status: 400 });
    }

    // ✅ Private store: MUST pass { access: 'private' }
    const result = await get(pathname, { access: "private" });

    // Vercel docs: result?.statusCode !== 200 => not found/unauthorized/etc
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "application/pdf",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: unknown) {
    console.error("GET /api/blob/proxy error:", err);
    const message = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
