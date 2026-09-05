import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const presets = [
  ["Mobile", 390, 844],
  ["Mobile Landscape", 844, 390],
  ["Laptop", 1366, 768],
  ["Full HD TV", 1920, 1080],
  ["4K TV", 3840, 2160]
];

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poster = await prisma.poster.findUnique({ where: { id } });
  if (!poster) {
    return <AdminShell><p>Poster not found.</p></AdminShell>;
  }
  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Preview Poster</h1>
          <p className="mt-1 text-sm text-slate-500">{poster.title}</p>
        </div>
        <Link href="/admin/posters" className="rounded-md border border-line bg-white px-4 py-2 text-sm">Back</Link>
      </div>
      <div className="space-y-6">
        {presets.map(([label, width, height]) => {
          const numericWidth = Number(width);
          const numericHeight = Number(height);
          return (
            <section key={label} className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium">{label}</span>
                <span className="text-slate-500">{numericWidth}x{numericHeight}</span>
              </div>
              <div className="overflow-auto rounded-md bg-slate-100 p-3">
                <div
                  className="mx-auto overflow-hidden bg-black"
                  style={{
                    aspectRatio: `${numericWidth}/${numericHeight}`,
                    width: "min(100%, 820px)",
                    maxHeight: "70vh"
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={poster.imageUrl} alt={poster.title} className={`h-full w-full fit-${poster.fitMode}`} />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </AdminShell>
  );
}
