"use client";

/**
 * Reproductor de audio para un audiolibro. Usa los controles nativos
 * (`<audio controls>`): accesibles por teclado, familiares para 50+ y sin
 * reproducción automática (cumple WCAG 1.4.2).
 */
export function AudioPlayer({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <audio
      controls
      preload="metadata"
      src={src}
      aria-label={`Reproductor de ${title}`}
      className="h-12 w-full"
    >
      Tu navegador no puede reproducir este audio.{" "}
      <a href={src} className="underline">
        Descárgalo aquí.
      </a>
    </audio>
  );
}
