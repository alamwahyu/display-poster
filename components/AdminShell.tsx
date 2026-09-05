"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Image, LogOut, Menu, Monitor, Settings, Users, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/posters", label: "Posters", icon: Image },
  { href: "/admin/displays", label: "Displays", icon: Monitor },
  { href: "/admin/settings/display", label: "Display Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  const Sidebar = (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-line bg-white">
      <div className="border-b border-line px-6 py-5">
        <p className="text-lg font-semibold">Poster Display</p>
        <p className="text-sm text-slate-500">Management Console</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium",
                active ? "bg-[#E7F2F0] text-accent" : "text-slate-600 hover:bg-panel"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-panel"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-panel">
      <div className="hidden min-h-screen lg:flex">{Sidebar}<main className="min-w-0 flex-1 p-8">{children}</main></div>
      <div className="lg:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3">
          <span className="font-semibold">Poster Display</span>
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-panel">
            <Menu size={22} />
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
            <div className="h-full w-80 max-w-[85vw]" onClick={(event) => event.stopPropagation()}>
              <div className="absolute left-72 top-3">
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-md bg-white p-2">
                  <X size={20} />
                </button>
              </div>
              {Sidebar}
            </div>
          </div>
        )}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
