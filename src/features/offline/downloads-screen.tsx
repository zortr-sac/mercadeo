"use client";
// Sección "Descargados": funciona 100% sin internet. Lee IndexedDB y reproduce
// los videos/audios desde el archivo local guardado.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBarMain, Card, ImagePlaceholder } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { useLocalMedia } from "@/hooks/use-local-media";
import { useOfflineStore } from "@/store/offline-store";
import { isDownloadableMediaUrl, removeAudiobook, removeCourse } from "@/lib/offline/download";
import {
  estimateUsage,
  listStoredAudiobooks,
  listStoredCourses,
  type StoredAudiobook,
  type StoredCourse,
} from "@/lib/offline/db";

function mb(bytes: number) {
  if (!bytes) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 1024 * 1024 * 10 ? 1 : 0)} MB`;
}

function OfflineVideo({ url, title }: { url: string; title: string }) {
  const src = useLocalMedia(url);
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
      <button
        className="ns-press"
        onClick={() => setOpen((o) => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", textAlign: "left" }}
      >
        <span style={{ width: 36, height: 36, borderRadius: 999, background: "var(--blue)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name="play" size={16} color="#fff" />
        </span>
        <span style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{title}</span>
      </button>
      {open && src && (
        <video
          src={src}
          controls
          autoPlay
          style={{ width: "100%", aspectRatio: "16/9", borderRadius: 14, background: "#000", marginTop: 10 }}
        />
      )}
    </div>
  );
}

function OfflineAudiobook({ entry, onRemoved }: { entry: StoredAudiobook; onRemoved: () => void }) {
  const book = entry.book;
  const audioSrc = useLocalMedia(book.audioUrl);
  const coverSrc = useLocalMedia(book.coverUrl);
  return (
    <Card pad={14} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, flexShrink: 0 }}>
          {coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverSrc} alt="" style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 12, display: "block" }} />
          ) : (
            <ImagePlaceholder theme="cover" icon="headphones" aspect="1/1" radius={12} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 17, lineHeight: 1.2 }}>{book.title}</h3>
          <p style={{ fontSize: 15, color: "var(--text-2)" }}>{book.author}</p>
        </div>
        <button
          className="ns-press"
          aria-label="Quitar descarga"
          onClick={onRemoved}
          style={{ background: "none", border: "none", color: "var(--locked)", padding: 6 }}
        >
          <Icon name="logout" size={20} color="var(--locked)" />
        </button>
      </div>
      {audioSrc && (
        <audio controls preload="metadata" src={audioSrc} style={{ width: "100%", height: 44 }} />
      )}
    </Card>
  );
}

export function DownloadsScreen() {
  const [courses, setCourses] = useState<StoredCourse[]>([]);
  const [books, setBooks] = useState<StoredAudiobook[]>([]);
  const [usage, setUsage] = useState(0);
  const online = useOfflineStore((s) => s.online);
  const markCourse = useOfflineStore((s) => s.markCourse);
  const markAudiobook = useOfflineStore((s) => s.markAudiobook);

  async function refresh() {
    try {
      const [c, b, u] = await Promise.all([
        listStoredCourses(),
        listStoredAudiobooks(),
        estimateUsage(),
      ]);
      setCourses(c.sort((x, y) => y.savedAt - x.savedAt));
      setBooks(b.sort((x, y) => y.savedAt - x.savedAt));
      setUsage(u.usage);
    } catch {
      // IndexedDB no disponible
    }
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [c, b, u] = await Promise.all([
          listStoredCourses(),
          listStoredAudiobooks(),
          estimateUsage(),
        ]);
        if (!active) return;
        setCourses(c.sort((x, y) => y.savedAt - x.savedAt));
        setBooks(b.sort((x, y) => y.savedAt - x.savedAt));
        setUsage(u.usage);
      } catch {
        // IndexedDB no disponible
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function delCourse(slug: string) {
    if (!window.confirm("¿Quitar este curso descargado del teléfono?")) return;
    await removeCourse(slug);
    markCourse(slug, false);
    await refresh();
    toast.success("Descarga eliminada.");
  }
  async function delBook(id: string) {
    if (!window.confirm("¿Quitar este audiolibro descargado del teléfono?")) return;
    await removeAudiobook(id);
    markAudiobook(id, false);
    await refresh();
    toast.success("Descarga eliminada.");
  }

  const empty = courses.length === 0 && books.length === 0;

  return (
    <>
      <TopBarMain title="Descargados" />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {!online && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--orange-soft)", borderRadius: 14, padding: "12px 14px" }}>
            <Icon name="shield" size={22} color="var(--orange)" />
            <span style={{ fontSize: 16, color: "var(--text-2)" }}>Sin internet. Aquí está todo lo que descargaste.</span>
          </div>
        )}

        <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: -2 }}>
          Lo que descargaste se ve y se escucha sin internet. {usage ? `Usa ${mb(usage)} de tu teléfono.` : ""}
        </p>

        {empty ? (
          <Card pad={20} style={{ textAlign: "center" }}>
            <div style={{ margin: "0 auto 8px", width: 56, height: 56, borderRadius: 999, background: "var(--blue-soft)", display: "grid", placeItems: "center" }}>
              <Icon name="download" size={26} color="var(--blue)" />
            </div>
            <h3 style={{ fontSize: 18 }}>Aún no has descargado nada</h3>
            <p style={{ fontSize: 16, color: "var(--text-2)", marginTop: 6 }}>
              En Academia y Audiolibros toca el botón de descarga para guardarlos y usarlos cuando no tengas internet.
            </p>
          </Card>
        ) : (
          <>
            {courses.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h2 style={{ fontSize: 20 }}>Cursos</h2>
                {courses.map((entry) => {
                  const lessons = entry.course.modules
                    .flatMap((m) => m.lessons)
                    .filter((l) => isDownloadableMediaUrl(l.videoUrl));
                  return (
                    <Card key={entry.slug} pad={14} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: 17, lineHeight: 1.2 }}>{entry.course.title}</h3>
                          <p style={{ fontSize: 14, color: "var(--text-2)" }}>{lessons.length} video(s) sin internet</p>
                        </div>
                        <button
                          className="ns-press"
                          aria-label="Quitar descarga"
                          onClick={() => delCourse(entry.slug)}
                          style={{ background: "none", border: "none", color: "var(--locked)", padding: 6 }}
                        >
                          <Icon name="logout" size={20} color="var(--locked)" />
                        </button>
                      </div>
                      {lessons.map((l) => (
                        <OfflineVideo key={l.id} url={l.videoUrl as string} title={l.title} />
                      ))}
                    </Card>
                  );
                })}
              </div>
            )}

            {books.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h2 style={{ fontSize: 20 }}>Audiolibros</h2>
                {books.map((entry) => (
                  <OfflineAudiobook key={entry.id} entry={entry} onRemoved={() => delBook(entry.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
