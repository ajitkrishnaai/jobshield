'use client';

import { openDB, type IDBPDatabase } from 'idb';
import type { Job, JobPhoto } from './types';

const DB_NAME = 'jobshield';
const DB_VERSION = 1;
const PHOTOS_STORE = 'photos';
const JOBS_KEY = 'jobshield_jobs';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
          db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// --- Jobs (localStorage) ---

export function getJobs(): Job[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(JOBS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getJob(id: string): Job | undefined {
  return getJobs().find((j) => j.id === id);
}

export function saveJob(job: Job): void {
  const jobs = getJobs();
  const idx = jobs.findIndex((j) => j.id === job.id);
  if (idx >= 0) {
    jobs[idx] = job;
  } else {
    jobs.unshift(job);
  }
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export function deleteJob(id: string): void {
  const jobs = getJobs().filter((j) => j.id !== id);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

// --- Photos (IndexedDB) ---

export async function savePhoto(photo: JobPhoto): Promise<void> {
  const db = await getDB();
  await db.put(PHOTOS_STORE, photo);
}

export async function getPhotosForJob(jobId: string, phase?: 'before' | 'after'): Promise<JobPhoto[]> {
  const db = await getDB();
  const all: JobPhoto[] = await db.getAll(PHOTOS_STORE);
  return all
    .filter((p) => p.jobId === jobId && (!phase || p.phase === phase))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export async function getPhoto(id: string): Promise<JobPhoto | undefined> {
  const db = await getDB();
  return db.get(PHOTOS_STORE, id);
}

export async function deletePhotosForJob(jobId: string): Promise<void> {
  const db = await getDB();
  const all: JobPhoto[] = await db.getAll(PHOTOS_STORE);
  const tx = db.transaction(PHOTOS_STORE, 'readwrite');
  for (const photo of all) {
    if (photo.jobId === jobId) {
      await tx.store.delete(photo.id);
    }
  }
  await tx.done;
}

// --- Utility ---

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
