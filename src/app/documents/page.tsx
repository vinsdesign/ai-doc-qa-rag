import { prisma } from "@/lib/db/prisma";

export default async function DocumentsPage() {
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Documents</h1>
      <pre>{JSON.stringify(docs, null, 2)}</pre>
    </main>
  );
}
