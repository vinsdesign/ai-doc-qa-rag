"use client";

import * as React from "react";

type Doc = {
  id: string;
  title: string;
  status: string;
  fileUrl: string;
  blobPathname?: string | null;
};

export default function DocumentsPage() {
  async function safeJson(res: Response) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  const [docs, setDocs] = React.useState<Doc[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  async function loadDocs() {
    setLoading(true);
    const res = await fetch("/api/documents/list");
    const data = await res.json();
    setDocs(data.documents ?? []);
    setLoading(false);
  }

  React.useEffect(() => {
    loadDocs();
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // 1) Upload PDF ke Vercel Blob lewat API server
    const fd = new FormData();
    fd.append("file", file);

    const upRes = await fetch("/api/upload", { method: "POST", body: fd });
    const upData = await upRes.json();
    if (!upRes.ok) {
      alert(upData?.error ?? "Upload failed");
      setUploading(false);
      return;
    }

    // 2) Simpan metadata document ke Neon via Prisma
    const createRes = await fetch("/api/documents", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: file.name,
        fileUrl: upData.url,
        blobPathname: upData.pathname,
      }),
    });

    const createData = await safeJson(createRes);

    if (!createRes.ok) {
      alert(createData?.error ?? createData?.raw ?? "Create document failed");
      setUploading(false);
      return;
    }

    await loadDocs();
    setUploading(false);
  }

  async function openPdf(doc: Doc) {
    if (!doc.blobPathname) {
      alert(
        "This document is missing blobPathname (legacy record). Re-upload it.",
      );
      return;
    }

    const url = `/api/blob/proxy?pathname=${encodeURIComponent(doc.blobPathname)}`;
    window.open(url, "_blank", "noreferrer");
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Documents</h1>

      <div
        style={{
          marginTop: 16,
          border: "1px solid #ddd",
          padding: 16,
          borderRadius: 12,
        }}
      >
        <input type="file" accept="application/pdf" onChange={onUpload} />
        {uploading && <div style={{ marginTop: 8 }}>Uploading...</div>}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={loadDocs} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <ul style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {docs.map((d) => (
          <li
            key={d.id}
            style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12 }}
          >
            <div style={{ fontWeight: 600 }}>{d.title}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{d.status}</div>
            <button onClick={() => openPdf(d)} style={{ fontSize: 12 }}>
              Open PDF
            </button>
          </li>
        ))}

        {docs.length === 0 && (
          <li style={{ opacity: 0.7 }}>No documents yet.</li>
        )}
      </ul>
    </main>
  );
}
