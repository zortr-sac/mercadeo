"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Audiobook, CourseWithContent } from "@/data/types";

const DB_NAME = "netscale-offline";
const DB_VERSION = 1;

export interface StoredMedia {
  url: string;
  blob: Blob;
  mime: string;
  bytes: number;
  savedAt: number;
}
export interface StoredCourse {
  slug: string;
  course: CourseWithContent;
  mediaUrls: string[];
  savedAt: number;
}
export interface StoredAudiobook {
  id: string;
  book: Audiobook;
  mediaUrls: string[];
  savedAt: number;
}

interface OfflineDB extends DBSchema {
  media: { key: string; value: StoredMedia };
  courses: { key: string; value: StoredCourse };
  audiobooks: { key: string; value: StoredAudiobook };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB no disponible en este navegador."));
  }
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("media")) db.createObjectStore("media", { keyPath: "url" });
        if (!db.objectStoreNames.contains("courses")) db.createObjectStore("courses", { keyPath: "slug" });
        if (!db.objectStoreNames.contains("audiobooks")) db.createObjectStore("audiobooks", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

/** Pide almacenamiento persistente (reduce la evicción, sobre todo en iOS). */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {
    // best-effort
  }
}

// --- media (blobs) ---
export async function putMedia(url: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put("media", { url, blob, mime: blob.type, bytes: blob.size, savedAt: Date.now() });
}
export async function getMediaBlob(url: string): Promise<Blob | null> {
  const db = await getDB();
  return (await db.get("media", url))?.blob ?? null;
}
export async function hasMedia(url: string): Promise<boolean> {
  const db = await getDB();
  return (await db.getKey("media", url)) !== undefined;
}

// --- courses ---
export async function putCourse(value: StoredCourse): Promise<void> {
  const db = await getDB();
  await db.put("courses", value);
}
export async function listStoredCourses(): Promise<StoredCourse[]> {
  const db = await getDB();
  return db.getAll("courses");
}
export async function deleteStoredCourse(slug: string): Promise<void> {
  const db = await getDB();
  const course = await db.get("courses", slug);
  if (course) for (const url of course.mediaUrls) await db.delete("media", url);
  await db.delete("courses", slug);
}

// --- audiobooks ---
export async function putStoredAudiobook(value: StoredAudiobook): Promise<void> {
  const db = await getDB();
  await db.put("audiobooks", value);
}
export async function listStoredAudiobooks(): Promise<StoredAudiobook[]> {
  const db = await getDB();
  return db.getAll("audiobooks");
}
export async function deleteStoredAudiobook(id: string): Promise<void> {
  const db = await getDB();
  const book = await db.get("audiobooks", id);
  if (book) for (const url of book.mediaUrls) await db.delete("media", url);
  await db.delete("audiobooks", id);
}

/** Espacio aproximado usado/cuota del navegador (bytes). */
export async function estimateUsage(): Promise<{ usage: number; quota: number }> {
  try {
    const est = await navigator.storage?.estimate?.();
    return { usage: est?.usage ?? 0, quota: est?.quota ?? 0 };
  } catch {
    return { usage: 0, quota: 0 };
  }
}
