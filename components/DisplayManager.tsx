"use client";

import { useState } from "react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";

type Display = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
  isDefault: boolean;
  _count?: { displayPosters: number };
};

export function DisplayManager({ initialDisplays, appUrl }: { initialDisplays: Display[]; appUrl: string }) {
  const [displays, setDisplays] = useState(initialDisplays);
  const [editing, setEditing] = useState<Display | null>(null);
  const [open, setOpen] = useState(false);

  async function reload() {
    const data = await fetch("/api/admin/displays").then((r) => r.json());
    setDisplays(data.displays);
  }

  async function removeDisplay(id: string) {
    if (!confirm("Delete this display? Posters will not be deleted.")) return;
    await fetch(`/api/admin/displays/${id}`, { method: "DELETE" });
    await reload();
  }

  async function copyUrl(slug: string) {
    const path = slug === "main" ? "/display" : `/display/${slug}`;
    await navigator.clipboard.writeText(`${appUrl}${path}`);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Displays</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola layar dan URL display per lokasi.</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus size={18} /> Add Display</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {displays.map((display) => (
          <article key={display.id} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{display.name}</h2>
                <p className="mt-1 text-sm text-slate-500">/{display.slug}</p>
              </div>
              <span className="rounded-full bg-panel px-2 py-1 text-xs">{display.status}</span>
            </div>
            <p className="mt-3 min-h-10 text-sm text-slate-600">{display.description || "No description"}</p>
            <div className="mt-3 text-sm text-slate-600">
              {display.isDefault ? "Default display" : "Custom display"} · {display._count?.displayPosters || 0} posters
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="secondary" className="min-h-9 px-3" onClick={() => copyUrl(display.slug)}><Copy size={16} /> URL</Button>
              <Button variant="secondary" className="min-h-9 px-3" onClick={() => { setEditing(display); setOpen(true); }}><Pencil size={16} /></Button>
              <Button variant="danger" className="min-h-9 px-3" onClick={() => removeDisplay(display.id)}><Trash2 size={16} /></Button>
            </div>
          </article>
        ))}
      </div>
      {open && <DisplayForm display={editing} onClose={() => setOpen(false)} onSaved={async () => { setOpen(false); await reload(); }} />}
    </div>
  );
}

function DisplayForm({ display, onClose, onSaved }: { display: Display | null; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(display ? `/api/admin/displays/${display.id}` : "/api/admin/displays", {
      method: display ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        slug: form.get("slug"),
        description: form.get("description"),
        status: form.get("status"),
        isDefault: form.get("isDefault") === "on"
      })
    });
    setSaving(false);
    if (response.ok) onSaved();
    else alert("Gagal menyimpan display. Slug mungkin sudah dipakai.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-xl font-semibold">{display ? "Edit Display" : "Add Display"}</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium">Name<input name="name" required defaultValue={display?.name} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="block text-sm font-medium">Slug<input name="slug" required defaultValue={display?.slug} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="block text-sm font-medium">Description<textarea name="description" defaultValue={display?.description || ""} rows={3} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="block text-sm font-medium">Status<select name="status" defaultValue={display?.status || "ACTIVE"} className="mt-1 w-full rounded-md border border-line px-3 py-2"><option>ACTIVE</option><option>INACTIVE</option></select></label>
          <label className="flex items-center gap-2 text-sm"><input name="isDefault" type="checkbox" defaultChecked={display?.isDefault} /> Default display</label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}
