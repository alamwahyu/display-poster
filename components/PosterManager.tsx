"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/Button";
import { formatDate } from "@/lib/utils";

type Display = { id: string; name: string; slug: string };
type Poster = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  status: "ACTIVE" | "INACTIVE";
  sortOrder: number;
  duration: number;
  fitMode: "CONTAIN" | "COVER" | "STRETCH";
  orientation: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
  displayPosters: { displayId: string; display: Display }[];
};

export function PosterManager({ initialPosters, displays }: { initialPosters: Poster[]; displays: Display[] }) {
  const [posters, setPosters] = useState(initialPosters);
  const [editing, setEditing] = useState<Poster | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const sorted = useMemo(() => [...posters].sort((a, b) => a.sortOrder - b.sortOrder), [posters]);

  async function reload() {
    const data = await fetch("/api/admin/posters").then((r) => r.json());
    setPosters(data.posters);
  }

  async function removePoster(id: string) {
    if (!confirm("Are you sure you want to delete this poster?")) return;
    await fetch(`/api/admin/posters/${id}`, { method: "DELETE" });
    setMessage("Poster deleted.");
    await reload();
  }

  async function togglePoster(poster: Poster) {
    const form = new FormData();
    form.set("title", poster.title);
    form.set("description", poster.description || "");
    form.set("status", poster.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
    form.set("sortOrder", String(poster.sortOrder));
    form.set("duration", String(poster.duration));
    form.set("fitMode", poster.fitMode);
    if (poster.startDate) form.set("startDate", new Date(poster.startDate).toISOString());
    if (poster.endDate) form.set("endDate", new Date(poster.endDate).toISOString());
    poster.displayPosters.forEach((row) => form.append("displayIds", row.displayId));
    await fetch(`/api/admin/posters/${poster.id}`, { method: "PUT", body: form });
    await reload();
  }

  async function dropOn(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = sorted.map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    const items = ids.map((id, index) => ({ id, sortOrder: index + 1 }));
    setPosters((current) => current.map((poster) => ({ ...poster, sortOrder: items.find((item) => item.id === poster.id)?.sortOrder ?? poster.sortOrder })));
    await fetch("/api/admin/posters/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    setDragId(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Posters</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola konten, jadwal, urutan, dan assignment display.</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={18} /> Add Poster</Button>
      </div>
      {message && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {sorted.map((poster) => (
          <article
            key={poster.id}
            draggable
            onDragStart={() => setDragId(poster.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOn(poster.id)}
            className="rounded-lg border border-line bg-white shadow-sm"
          >
            <div className="aspect-video overflow-hidden rounded-t-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={poster.thumbnailUrl || poster.imageUrl} alt={poster.title} loading="lazy" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} />
            </div>
            <div className="space-y-3 p-4">
              <div>
                <h2 className="line-clamp-2 font-semibold">{poster.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{poster.displayPosters.map((row) => row.display.name).join(", ") || "No display"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <span>Status: <b>{poster.status}</b></span>
                <span>Order: <b>{poster.sortOrder}</b></span>
                <span>Duration: <b>{poster.duration}s</b></span>
                <span>{poster.orientation}</span>
                <span>Created: {formatDate(poster.createdAt)}</span>
                <span>Updated: {formatDate(poster.updatedAt)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/posters/${poster.id}/preview`} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-line px-3 text-sm hover:bg-panel"><Eye size={16} /> Preview</Link>
                <Button variant="secondary" className="min-h-9 px-3" onClick={() => { setEditing(poster); setShowForm(true); }}><Pencil size={16} /></Button>
                <Button variant="secondary" className="min-h-9 px-3" onClick={() => togglePoster(poster)}>{poster.status === "ACTIVE" ? "Deactivate" : "Activate"}</Button>
                <Button variant="danger" className="min-h-9 px-3" onClick={() => removePoster(poster.id)}><Trash2 size={16} /></Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {showForm && (
        <PosterForm
          poster={editing}
          displays={displays}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            setMessage("Poster saved.");
            await reload();
          }}
        />
      )}
    </div>
  );
}

function toDateInput(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

function PosterForm({ poster, displays, onClose, onSaved }: { poster: Poster | null; displays: Display[]; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const selected = new Set(poster?.displayPosters.map((row) => row.displayId) || displays.filter((display) => display.slug === "main").map((display) => display.id));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch(poster ? `/api/admin/posters/${poster.id}` : "/api/admin/posters", {
      method: poster ? "PUT" : "POST",
      body: new FormData(event.currentTarget)
    });
    setSaving(false);
    if (response.ok) onSaved();
    else alert("Gagal menyimpan poster. Periksa data dan file gambar.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-5 shadow-xl">
        <h2 className="text-xl font-semibold">{poster ? "Edit Poster" : "Add Poster"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium">Title<input name="title" required defaultValue={poster?.title} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2 text-sm font-medium">Description<textarea name="description" defaultValue={poster?.description || ""} rows={3} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="sm:col-span-2 text-sm font-medium">Poster Upload<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required={!poster} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="text-sm font-medium">Status<select name="status" defaultValue={poster?.status || "ACTIVE"} className="mt-1 w-full rounded-md border border-line px-3 py-2"><option>ACTIVE</option><option>INACTIVE</option></select></label>
          <label className="text-sm font-medium">Fit Mode<select name="fitMode" defaultValue={poster?.fitMode || "CONTAIN"} className="mt-1 w-full rounded-md border border-line px-3 py-2"><option>CONTAIN</option><option>COVER</option><option>STRETCH</option></select></label>
          <label className="text-sm font-medium">Sort Order<input name="sortOrder" type="number" min={0} defaultValue={poster?.sortOrder || 1} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="text-sm font-medium">Duration (seconds)<input name="duration" type="number" min={1} defaultValue={poster?.duration || 10} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="text-sm font-medium">Start Date & Time<input name="startDate" type="datetime-local" defaultValue={toDateInput(poster?.startDate)} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <label className="text-sm font-medium">End Date & Time<input name="endDate" type="datetime-local" defaultValue={toDateInput(poster?.endDate)} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm font-medium">Displays</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {displays.map((display) => (
                <label key={display.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
                  <input name="displayIds" type="checkbox" value={display.id} defaultChecked={selected.has(display.id)} />
                  {display.name}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={saving}><Upload size={18} /> {saving ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}
