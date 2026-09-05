import { AdminShell } from "@/components/AdminShell";
import { DisplaySettingsForm } from "@/components/DisplaySettingsForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DisplaySettingsPage() {
  const display = await prisma.display.findFirst({ where: { isDefault: true }, include: { setting: true } });
  if (!display) {
    return (
      <AdminShell>
        <p className="rounded-lg border border-line bg-white p-5">Default display belum dibuat. Jalankan `npm run seed`.</p>
      </AdminShell>
    );
  }
  const setting = display.setting || (await prisma.displaySetting.create({ data: { displayId: display.id } }));
  return (
    <AdminShell>
      <h1 className="text-2xl font-semibold">Display Settings</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Setting global untuk default display.</p>
      <DisplaySettingsForm setting={setting} />
    </AdminShell>
  );
}
