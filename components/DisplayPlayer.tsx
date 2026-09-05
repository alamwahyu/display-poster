"use client";

import { Maximize2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Poster = {
  id: string;
  title: string;
  imageUrl: string;
  duration: number;
  fitMode: "CONTAIN" | "COVER" | "STRETCH";
};

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

type Payload = {
  display: { id: string; name: string; slug: string } | null;
  settings: Setting | null;
  posters: Poster[];
};

const fallbackSetting: Setting = {
  defaultDuration: 10,
  transition: "FADE",
  transitionDuration: 500,
  backgroundColor: "#000000",
  defaultFitMode: "CONTAIN",
  pollingInterval: 15,
  enableFullscreenButton: true,
  hideCursor: true,
  showEmptyMessage: false
};

export function DisplayPlayer({
  slug,
  initialPayload,
  forceFit,
  debug,
  autoFullscreen
}: {
  slug?: string;
  initialPayload: Payload;
  forceFit?: "CONTAIN" | "COVER" | "STRETCH";
  debug: boolean;
  autoFullscreen: boolean;
}) {
  const storageKey = `display-playlist:${slug || "default"}`;
  const [payload, setPayload] = useState(initialPayload);
  const [index, setIndex] = useState(0);
  const [visibleUi, setVisibleUi] = useState(true);
  const [needsGesture, setNeedsGesture] = useState(autoFullscreen);
  const [resolution, setResolution] = useState("0x0");
  const timerRef = useRef<number | null>(null);
  const uiTimerRef = useRef<number | null>(null);
  const signatureRef = useRef(JSON.stringify(initialPayload));

  const settings = payload.settings || fallbackSetting;
  const posters = payload.posters || [];
  const current = posters[index] || null;
  const next = posters[(index + 1) % posters.length] || null;
  const fit = forceFit || current?.fitMode || settings.defaultFitMode;

  const endpoint = slug ? `/api/display/${slug}` : "/api/display";

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      setNeedsGesture(false);
    } catch {
      setNeedsGesture(true);
    }
  }, []);

  const move = useCallback((delta: number) => {
    setIndex((value) => {
      if (posters.length === 0) return 0;
      return (value + delta + posters.length) % posters.length;
    });
  }, [posters.length]);

  useEffect(() => {
    document.body.classList.add("display-surface");
    const id = window.setTimeout(() => {
      const cached = localStorage.getItem(storageKey);
      if (cached && posters.length === 0) setPayload(JSON.parse(cached));
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.body.classList.remove("display-surface");
    };
  }, [posters.length, storageKey]);

  useEffect(() => {
    if (initialPayload.posters.length) localStorage.setItem(storageKey, JSON.stringify(initialPayload));
  }, [initialPayload, storageKey]);

  useEffect(() => {
    async function poll() {
      try {
        const data: Payload = await fetch(endpoint, { cache: "no-store" }).then((r) => r.json());
        const nextSignature = JSON.stringify(data);
        if (nextSignature !== signatureRef.current) {
          signatureRef.current = nextSignature;
          setPayload(data);
          localStorage.setItem(storageKey, nextSignature);
          setIndex((value) => Math.min(value, Math.max(0, data.posters.length - 1)));
        }
      } catch {
        const cached = localStorage.getItem(storageKey);
        if (cached) setPayload(JSON.parse(cached));
      }
    }
    const id = window.setInterval(poll, Math.max(10, settings.pollingInterval) * 1000);
    return () => window.clearInterval(id);
  }, [endpoint, settings.pollingInterval, storageKey]);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (posters.length > 1 && current) {
      timerRef.current = window.setTimeout(() => move(1), Math.max(1, current.duration || settings.defaultDuration) * 1000);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [current, move, posters.length, settings.defaultDuration]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
      if (event.key.toLowerCase() === "f") enterFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterFullscreen, move]);

  useEffect(() => {
    function updateResolution() {
      setResolution(`${window.innerWidth}x${window.innerHeight}`);
    }
    function onPointer() {
      setVisibleUi(true);
      if (uiTimerRef.current) window.clearTimeout(uiTimerRef.current);
      uiTimerRef.current = window.setTimeout(() => setVisibleUi(false), 3000);
    }
    updateResolution();
    onPointer();
    window.addEventListener("resize", updateResolution);
    window.addEventListener("mousemove", onPointer);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("resize", updateResolution);
      window.removeEventListener("mousemove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      if (uiTimerRef.current) window.clearTimeout(uiTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoFullscreen) return;
    const id = window.setTimeout(() => {
      void enterFullscreen();
    }, 0);
    return () => window.clearTimeout(id);
  }, [autoFullscreen, enterFullscreen]);

  const transitionClass = useMemo(() => {
    if (settings.transition === "NONE") return "";
    if (settings.transition === "SLIDE") return "transition-transform";
    return "transition-opacity";
  }, [settings.transition]);

  return (
    <main
      className={cn("display-page relative", settings.hideCursor && !visibleUi && "cursor-none")}
      style={{ backgroundColor: settings.backgroundColor }}
      onClick={() => needsGesture && enterFullscreen()}
    >
      {next && <link rel="preload" as="image" href={next.imageUrl} />}
      {current ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current.id}
            src={current.imageUrl}
            alt=""
            className={cn("display-image", `fit-${fit}`, transitionClass)}
            style={{ transitionDuration: `${settings.transitionDuration}ms` }}
            draggable={false}
          />
        </>
      ) : (
        settings.showEmptyMessage && <div className="flex h-screen w-screen items-center justify-center text-sm text-white/60">No Active Poster</div>
      )}
      {settings.enableFullscreenButton && visibleUi && (
        <button
          aria-label="Enter fullscreen"
          onClick={enterFullscreen}
          className="fixed right-4 top-4 z-20 rounded-md bg-black/55 p-3 text-white backdrop-blur hover:bg-black/75"
        >
          <Maximize2 size={20} />
        </button>
      )}
      {needsGesture && (
        <button onClick={enterFullscreen} className="fixed inset-0 z-10 flex items-center justify-center bg-black/20 text-sm text-white/80">
          Tap / Click to Enter Fullscreen
        </button>
      )}
      {debug && (
        <div className="fixed bottom-3 left-3 z-30 rounded-md bg-black/65 p-3 font-mono text-xs text-white">
          <div>{payload.display?.name || "No display"}</div>
          <div>{current?.title || "No poster"}</div>
          <div>{posters.length ? index + 1 : 0}/{posters.length}</div>
          <div>{resolution}</div>
          <div>{fit}</div>
        </div>
      )}
    </main>
  );
}
