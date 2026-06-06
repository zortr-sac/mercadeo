"use client";
// Pantalla 19 — Audiolibros. Reproductor real con descarga offline: el audio y la
// portada se reproducen desde IndexedDB si están descargados (offline + ahorra datos).
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  TopBarSub, Card, ImagePlaceholder, ProgressBar, Btn, STATUS_PAD,
} from "@/components/netscale/ui";
import type { PhTheme } from "@/components/netscale/ui";
import { Icon, type IconName } from "@/components/netscale/icons";
import type { Audiobook } from "@/data/types";
import { useLocalMedia } from "@/hooks/use-local-media";
import { useOfflineStore } from "@/store/offline-store";
import {
  downloadAudiobook,
  getLocalMediaUrl,
  isDownloadableMediaUrl,
  removeAudiobook,
} from "@/lib/offline/download";
import { DownloadButton } from "@/features/offline/download-button";

const THEMES: PhTheme[] = ["cover", "warm", "green"];

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Cover({ book, idx, size, radius }: { book: Audiobook; idx: number; size: number; radius: number }) {
  const coverSrc = useLocalMedia(book.coverUrl);
  if (coverSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={coverSrc} alt="" style={{ width: size, height: size, objectFit: "cover", borderRadius: radius, display: "block" }} />
    );
  }
  return <ImagePlaceholder theme={THEMES[idx % THEMES.length]} icon="headphones" aspect="1/1" radius={radius} />;
}

export function AudiobookPlayerScreen({ audiobooks }: { audiobooks: Audiobook[] }) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const objUrlRef = useRef<string | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const downloadedSet = useOfflineStore((s) => s.downloadedAudiobooks);
  const markAudiobook = useOfflineStore((s) => s.markAudiobook);
  const setStatus = useOfflineStore((s) => s.setStatus);

  const book = playing !== null ? audiobooks[playing] : null;
  const anyDownloadable = audiobooks.some((b) => isDownloadableMediaUrl(b.audioUrl));

  useEffect(() => () => {
    if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
  }, []);

  const play = (i: number) => {
    const b = audiobooks[i];
    if (!b.audioUrl) return;
    const a = audioRef.current;
    if (playing === i) {
      if (a) {
        if (a.paused) { void a.play(); setPaused(false); } else { a.pause(); setPaused(true); }
      }
      return;
    }
    setPlaying(i); setPaused(false); setCur(0); setDur(0);
    void (async () => {
      const local = await getLocalMediaUrl(b.audioUrl);
      if (objUrlRef.current) { URL.revokeObjectURL(objUrlRef.current); objUrlRef.current = null; }
      if (local) objUrlRef.current = local;
      if (a) { a.src = local ?? b.audioUrl!; void a.play().catch(() => {}); }
    })();
  };

  const togglePause = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { void a.play(); setPaused(false); } else { a.pause(); setPaused(true); }
  };

  const seek = (delta: number) => {
    const a = audioRef.current;
    if (a) a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + delta));
  };

  async function downloadAll() {
    for (const b of audiobooks) {
      if (downloadedSet.has(b.id) || !isDownloadableMediaUrl(b.audioUrl)) continue;
      const key = `audio:${b.id}`;
      setStatus(key, { state: "downloading", done: 0, total: 0 });
      try {
        await downloadAudiobook(b, (p) => setStatus(key, { state: "downloading", done: p.done, total: p.total }));
        markAudiobook(b.id, true);
        setStatus(key, { state: "done", done: 0, total: 0 });
      } catch {
        setStatus(key, { state: "error", done: 0, total: 0 });
      }
    }
    toast.success("Audiolibros descargados para usar sin internet.");
  }

  return (
    <>
      <TopBarSub title="Audiolibros" onBack={() => router.back()} />
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onEnded={() => setPaused(true)}
      />

      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: book ? 110 : 20 }}>
        {audiobooks.length === 0 && (
          <p style={{ fontSize: 18, color: "var(--text-2)", marginTop: 8 }}>Aún no hay audiolibros disponibles.</p>
        )}

        {anyDownloadable && (
          <Btn size="md" variant="soft" icon="download" onClick={downloadAll}>
            Descargar todos para usar sin internet
          </Btn>
        )}

        {audiobooks.map((b, i) => (
          <Card key={b.id} pad={14} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 84 }}>
            <div style={{ width: 56, flexShrink: 0 }}>
              <Cover book={b} idx={i} size={56} radius={12} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 18, lineHeight: 1.25 }}>{b.title}</h3>
              <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 2 }}>{b.author}</p>
            </div>
            {isDownloadableMediaUrl(b.audioUrl) && (
              <DownloadButton
                itemKey={`audio:${b.id}`}
                variant="compact"
                downloaded={downloadedSet.has(b.id)}
                download={(onP) => downloadAudiobook(b, onP)}
                remove={() => removeAudiobook(b.id)}
                onChange={(d) => markAudiobook(b.id, d)}
              />
            )}
            <button className="ns-press" onClick={() => play(i)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none",
            }}>
              <span style={{
                width: 52, height: 52, borderRadius: 999, background: "var(--blue)",
                display: "grid", placeItems: "center", boxShadow: "0 4px 12px rgba(29,78,216,.28)",
              }}>
                <Icon name={(playing === i && !paused) ? "pause" : "play"} size={22} color="#fff" />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>Oír</span>
            </button>
          </Card>
        ))}
      </div>

      {/* now-playing mini bar */}
      {book && !expanded && (
        <div onClick={() => setExpanded(true)} className="ns-press" style={{
          position: "absolute", left: 12, right: 12, bottom: "calc(var(--nav-h) + 8px)", zIndex: 40,
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
          boxShadow: "var(--shadow-pop)", display: "flex", alignItems: "center", gap: 12, padding: 10, cursor: "pointer",
        }}>
          <div style={{ width: 44, flexShrink: 0 }}>
            <Cover book={book} idx={playing ?? 0} size={44} radius={10} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</div>
            <div style={{ fontSize: 14, color: "var(--text-2)" }}>{paused ? "En pausa" : "Reproduciendo…"}</div>
          </div>
          <button className="ns-press" onClick={(e) => { e.stopPropagation(); togglePause(); }} style={{
            width: 48, height: 48, borderRadius: 999, background: "var(--blue-soft)", display: "grid", placeItems: "center",
          }}>
            <Icon name={paused ? "play" : "pause"} size={22} color="var(--blue)" />
          </button>
        </div>
      )}

      {/* full player */}
      {book && expanded && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 70, background: "var(--bg)",
          display: "flex", flexDirection: "column", animation: "ns-sheet-up .3s cubic-bezier(.2,.8,.2,1) both",
        }}>
          <div style={{ padding: `${STATUS_PAD}px 14px 0` }}>
            <button className="ns-press" onClick={() => setExpanded(false)} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "8px 12px 8px 6px", color: "var(--blue)", fontWeight: 600, fontSize: 18,
            }}>
              <Icon name="chevL" size={24} color="var(--blue)" strokeWidth={2.4} /> Cerrar
            </button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 28 }}>
            <div style={{ width: 220, maxWidth: "70%" }}>
              <Cover book={book} idx={playing ?? 0} size={220} radius={24} />
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 24 }}>{book.title}</h1>
              <p style={{ fontSize: 17, color: "var(--text-2)", marginTop: 4 }}>{book.author}</p>
            </div>
            <div style={{ width: "100%" }}>
              <ProgressBar value={cur} total={dur || 1} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text-2)", marginTop: 6 }}>
                <span>{fmt(cur)}</span><span>{fmt(dur)}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
              <PlayerCtrl icon="back15" label="−15s" onClick={() => seek(-15)} />
              <button className="ns-press" onClick={togglePause} style={{
                width: 84, height: 84, borderRadius: 999, background: "var(--blue)", display: "grid", placeItems: "center",
                boxShadow: "0 8px 20px rgba(29,78,216,.35)",
              }}>
                <Icon name={paused ? "play" : "pause"} size={38} color="#fff" />
              </button>
              <PlayerCtrl icon="fwd15" label="+15s" onClick={() => seek(15)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PlayerCtrl({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button className="ns-press" onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none",
    }}>
      <span style={{
        width: 60, height: 60, borderRadius: 999, background: "var(--surface)", border: "1.5px solid var(--border)",
        display: "grid", placeItems: "center",
      }}>
        <Icon name={icon} size={28} color="var(--text)" />
      </span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
    </button>
  );
}
