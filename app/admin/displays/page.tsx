import { headers } from "next/headers";
import { AdminShell } from "@/components/AdminShell";
import { DisplayManager } from "@/components/DisplayManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DisplaysPage() {
  const displays = await prisma.display.findMany({
    include: { _count: { select: { displayPosters: true } } },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });
  const headerStore = await headers();
  const host = headerStore.get("host") || "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") || "http";
  const appUrl = process.env.APP_URL || `${proto}://${host}`;

  return (
    <AdminShell>
      <DisplayManager initialDisplays={JSON.parse(JSON.stringify(displays))} appUrl={appUrl} />
    </AdminShell>
  );
}
