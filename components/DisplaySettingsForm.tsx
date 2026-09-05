"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

type Setting = {
  defaultDuration: number;
  transition: "FADE" | "SLIDE" | "NONE";
  transitionDuration: number;
  backgroundColor: string;
  defaultFitMode: "CONTAIN" | "COVER" | "STRETCH";
  pollingInterval: number;
  enableFullscreenButton: boolean;
  hideCursor: boolean;
  showEmptyMessage: boolean;
};

export function DisplaySettingsForm({ setting }: { setting: Setting }) {
  const [saved, setSaved] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/settings/display", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        defaultDuration: form.get("defaultDuration"),
        transition: form.get("transition"),
        transitionDuration: form.get("transitionDuration"),
        backgroundColor: form.get("backgroundColor"),
        defaultFitMode: form.get("defaultFitMode"),
        pollingInterval: form.get("pollingInterval"),
        enableFullscreenButton: form.get("enableFullscreenButton") === "on",
        hideCursor: form.get("hideCursor") === "on",
        showEmptyMessage: form.get("showEmptyMessage") === "on"
      })
    });
    setSaved(response.ok);
  }

  return (
    <form onSubmit={submit} className="max-w-3xl rounded-lg border border-line bg-white p-5 shadow-sm">
      {saved && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Settings saved.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Default Duration<input name="defaultDuration" type="number" min={1} defaultValue={setting.defaultDuration} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <label className="text-sm font-medium">Transition Duration (ms)<input name="transitionDuration" type="number" min={0} defaultValue={setting.transitionDuration} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <label className="text-sm font-medium">Transition<select name="transition" defaultValue={setting.transition} className="mt-1 w-full rounded-md border border-line px-3 py-2"><option>FADE</option><option>SLIDE</option><option>NONE</option></select></label>
        <label className="text-sm font-medium">Default Fit Mode<select name="defaultFitMode" defaultValue={setting.defaultFitMode} className="mt-1 w-full rounded-md border border-line px-3 py-2"><option>CONTAIN</option><option>COVER</option><option>STRETCH</option></select></label>
        <label className="text-sm font-medium">Background Color<input name="backgroundColor" type="color" defaultValue={setting.backgroundColor} className="mt-1 h-10 w-full rounded-md border border-line px-2 py-1" /></label>
        <label className="text-sm font-medium">Polling Interval (seconds)<input name="pollingInterval" type="number" min={10} defaultValue={setting.pollingInterval} className="mt-1 w-full rounded-md border border-line px-3 py-2" /></label>
        <label className="flex items-center gap-2 text-sm"><input name="enableFullscreenButton" type="checkbox" defaultChecked={setting.enableFullscreenButton} /> Enable fullscreen button</label>
        <label className="flex items-center gap-2 text-sm"><input name="hideCursor" type="checkbox" defaultChecked={setting.hideCursor} /> Hide cursor when idle</label>
        <label className="flex items-center gap-2 text-sm"><input name="showEmptyMessage" type="checkbox" defaultChecked={setting.showEmptyMessage} /> Show empty message</label>
      </div>
      <div className="mt-6">
        <Button>Save Settings</Button>
      </div>
    </form>
  );
}
