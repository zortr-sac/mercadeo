"use client";
// Pantalla 6 — Lección de video. "Ya lo vi" persiste vía markLessonCompleteAction.
// Si el video está descargado, se reproduce desde el archivo local (sin internet).
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TopBarSub, ImagePlaceholder, ProgressBar, Btn, Toast } from "@/components/netscale/ui";
import { Icon } from "@/components/netscale/icons";
import { useLocalMedia } from "@/hooks/use-local-media";
import { markLessonCompleteAction } from "./actions";

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function VideoLessonScreen({
  courseTitle, lessonId, lessonTitle, videoUrl, alreadySeen, nextHref,
}: {
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  videoUrl: string | null;
  alreadySeen: boolean;
  nextHref: string | null;
}) {
  const router = useRouter();
  const [seen, setSeen] = useState(alreadySeen);
  const [showToast, setShowToast] = useState(false);
  const [, start] = useTransition();
  const playSrc = useLocalMedia(videoUrl);

  const markSeen = () => {
    if (seen) return;
    setSeen(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
    start(async () => {
      try {
        await markLessonCompleteAction(lessonId);
      } catch {
        // progress write never blocks the user
      }
    });
  };

  const ytId = videoUrl ? youtubeId(videoUrl) : null;

  return (
    <>
      <TopBarSub title={courseTitle} onBack={() => router.back()} />
      <div className="ns-scroll ns-pad" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {ytId ? (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 18, overflow: "hidden", background: "#000" }}>
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={lessonTitle}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : videoUrl ? (
          <video src={playSrc ?? videoUrl} controls style={{ width: "100%", aspectRatio: "16/9", borderRadius: 18, background: "#000" }} />
        ) : (
          <div style={{ position: "relative" }}>
            <ImagePlaceholder theme="slide" icon="play" aspect="16/9" />
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div style={{ width: 76, height: 76, borderRadius: 999, background: "rgba(255,255,255,.95)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-pop)" }}>
                <Icon name="play" size={34} color="var(--blue)" />
              </div>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, bottom: 14 }}>
              <ProgressBar value={seen ? 1 : 0.15} total={1} height={6} color="#fff" />
            </div>
          </div>
        )}
        <h1 style={{ fontSize: 24, lineHeight: 1.25 }}>{lessonTitle}</h1>
        <p style={{ fontSize: 18, color: "var(--text-2)" }}>
          Un video corto y claro. Míralo con calma; cuando termines, toca el botón verde para guardar tu avance.
        </p>
        <Btn size="xl" variant={seen ? "soft" : "success"} icon="check" onClick={markSeen}>
          {seen ? "¡Guardado!" : "Ya lo vi"}
        </Btn>
        <Btn size="md" variant="outline" iconRight="chevR" onClick={() => (nextHref ? router.push(nextHref) : router.back())}>
          Siguiente video
        </Btn>
      </div>
      <Toast show={showToast}>¡Muy bien! Avance guardado</Toast>
    </>
  );
}
