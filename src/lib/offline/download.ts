"use client";

import type { Audiobook, CourseWithContent } from "@/data/types";
import {
  deleteStoredAudiobook,
  deleteStoredCourse,
  getMediaBlob,
  hasMedia,
  putCourse,
  putMedia,
  putStoredAudiobook,
  requestPersistentStorage,
} from "@/lib/offline/db";

/** ¿Es una URL de un archivo subido a Storage (descargable) y NO de YouTube? */
export function isDownloadableMediaUrl(
  url: string | null | undefined,
): url is string {
  return !!url && url.includes("/storage/v1/object/public/business-media/");
}

async function fetchAndStore(url: string): Promise<void> {
  if (await hasMedia(url)) return;
  const res = await fetch(`/api/offline/media?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("No se pudo descargar el archivo.");
  await putMedia(url, await res.blob());
}

function courseMediaUrls(course: CourseWithContent): string[] {
  const urls: string[] = [];
  if (isDownloadableMediaUrl(course.coverUrl)) urls.push(course.coverUrl);
  for (const lesson of course.modules.flatMap((m) => m.lessons)) {
    if (isDownloadableMediaUrl(lesson.videoUrl)) urls.push(lesson.videoUrl);
  }
  return urls;
}

export interface DownloadProgress {
  done: number;
  total: number;
}

/** Descarga un curso (portada + videos subidos; omite los de YouTube). */
export async function downloadCourse(
  course: CourseWithContent,
  onProgress?: (p: DownloadProgress) => void,
): Promise<{ skipped: number }> {
  await requestPersistentStorage();
  const urls = courseMediaUrls(course);
  const lessons = course.modules.flatMap((m) => m.lessons);
  const skipped = lessons.filter(
    (l) => l.videoUrl && !isDownloadableMediaUrl(l.videoUrl),
  ).length;

  let done = 0;
  onProgress?.({ done, total: urls.length });
  for (const url of urls) {
    await fetchAndStore(url);
    onProgress?.({ done: (done += 1), total: urls.length });
  }
  await putCourse({ slug: course.slug, course, mediaUrls: urls, savedAt: Date.now() });
  return { skipped };
}

export async function removeCourse(slug: string): Promise<void> {
  await deleteStoredCourse(slug);
}

/** Descarga un audiolibro (audio + portada). */
export async function downloadAudiobook(
  book: Audiobook,
  onProgress?: (p: DownloadProgress) => void,
): Promise<void> {
  await requestPersistentStorage();
  const urls = [book.audioUrl, book.coverUrl].filter(isDownloadableMediaUrl);
  let done = 0;
  onProgress?.({ done, total: urls.length });
  for (const url of urls) {
    await fetchAndStore(url);
    onProgress?.({ done: (done += 1), total: urls.length });
  }
  await putStoredAudiobook({ id: book.id, book, mediaUrls: urls, savedAt: Date.now() });
}

export async function removeAudiobook(id: string): Promise<void> {
  await deleteStoredAudiobook(id);
}

/** ObjectURL del blob local si está descargado; si no, null. */
export async function getLocalMediaUrl(
  url: string | null | undefined,
): Promise<string | null> {
  if (!isDownloadableMediaUrl(url)) return null;
  const blob = await getMediaBlob(url);
  return blob ? URL.createObjectURL(blob) : null;
}
