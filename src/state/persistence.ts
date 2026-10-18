import {GENRES, type Feedback, type Genre, type Profile} from '../domain/types';
import type {KeyValueStore} from './store';

/**
 * Local persistence for profiles and feedback.
 *
 * Stored payloads are untrusted: any missing, malformed or partially valid data
 * is handled gracefully. Reads never throw — they return the valid subset (or an
 * empty list) and report the problem through `onError` when supplied. Writes
 * propagate storage failures so callers can react (for example, show an error).
 */

export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  profiles: '@everyones-pick/profiles:v1',
  feedback: '@everyones-pick/feedback:v1',
} as const;

export interface LoadOptions {
  /** Called with any error encountered while reading or parsing stored data. */
  readonly onError?: (error: unknown) => void;
}

export interface AppState {
  readonly profiles: Profile[];
  readonly feedback: Feedback[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isGenre(value: unknown): value is Genre {
  return typeof value === 'string' && (GENRES as readonly string[]).includes(value);
}

function sanitizeGenres(value: unknown): Genre[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const result: Genre[] = [];
  for (const entry of value) {
    if (isGenre(entry) && !result.includes(entry)) {
      result.push(entry);
    }
  }
  return result;
}

function sanitizeProfile(value: unknown): Profile | null {
  if (!isRecord(value)) {
    return null;
  }
  const id = value.id;
  const age = value.age;
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  if (typeof age !== 'number' || !Number.isFinite(age) || age < 0) {
    return null;
  }
  const name = typeof value.name === 'string' && value.name.length > 0 ? value.name : id;
  return {
    id,
    name,
    age,
    favoriteGenres: sanitizeGenres(value.favoriteGenres),
    avoidGenres: sanitizeGenres(value.avoidGenres),
  };
}

function sanitizeProfiles(values: readonly unknown[]): Profile[] {
  const seen = new Set<string>();
  const result: Profile[] = [];
  for (const value of values) {
    const profile = sanitizeProfile(value);
    if (profile === null || seen.has(profile.id)) {
      continue;
    }
    seen.add(profile.id);
    result.push(profile);
  }
  return result;
}

function sanitizeFeedback(value: unknown): Feedback | null {
  if (!isRecord(value)) {
    return null;
  }
  const {profileId, titleId, kind} = value;
  if (typeof profileId !== 'string' || profileId.length === 0) {
    return null;
  }
  if (typeof titleId !== 'string' || titleId.length === 0) {
    return null;
  }
  if (kind !== 'like' && kind !== 'dislike') {
    return null;
  }
  const at = typeof value.at === 'number' && Number.isFinite(value.at) ? value.at : 0;
  return {profileId, titleId, kind, at};
}

function sanitizeFeedbackList(values: readonly unknown[]): Feedback[] {
  const result: Feedback[] = [];
  for (const value of values) {
    const feedback = sanitizeFeedback(value);
    if (feedback !== null) {
      result.push(feedback);
    }
  }
  return result;
}

/**
 * Accepts either the versioned envelope `{version, data: [...]}` or a bare
 * array (legacy/foreign payload). Returns `null` when the shape is unknown.
 */
function unwrap(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data;
  }
  return null;
}

function serialize(data: unknown): string {
  return JSON.stringify({version: STORAGE_VERSION, data});
}

async function loadList<T>(
  store: KeyValueStore,
  key: string,
  sanitize: (values: readonly unknown[]) => T[],
  options: LoadOptions,
): Promise<T[]> {
  let raw: string | null;
  try {
    raw = await store.getItem(key);
  } catch (error) {
    options.onError?.(error);
    return [];
  }

  if (raw === null || raw === '') {
    return [];
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    options.onError?.(error);
    return [];
  }

  const values = unwrap(payload);
  if (values === null) {
    options.onError?.(new Error(`everyones-pick: unrecognized payload for "${key}"`));
    return [];
  }

  return sanitize(values);
}

export function loadProfiles(store: KeyValueStore, options: LoadOptions = {}): Promise<Profile[]> {
  return loadList(store, STORAGE_KEYS.profiles, sanitizeProfiles, options);
}

export function saveProfiles(store: KeyValueStore, profiles: readonly Profile[]): Promise<void> {
  return store.setItem(STORAGE_KEYS.profiles, serialize(profiles));
}

export function loadFeedback(store: KeyValueStore, options: LoadOptions = {}): Promise<Feedback[]> {
  return loadList(store, STORAGE_KEYS.feedback, sanitizeFeedbackList, options);
}

export function saveFeedback(store: KeyValueStore, feedback: readonly Feedback[]): Promise<void> {
  return store.setItem(STORAGE_KEYS.feedback, serialize(feedback));
}

export async function loadAppState(
  store: KeyValueStore,
  options: LoadOptions = {},
): Promise<AppState> {
  const [profiles, feedback] = await Promise.all([
    loadProfiles(store, options),
    loadFeedback(store, options),
  ]);
  return {profiles, feedback};
}

export async function clearStoredData(store: KeyValueStore): Promise<void> {
  await Promise.all([
    store.removeItem(STORAGE_KEYS.profiles),
    store.removeItem(STORAGE_KEYS.feedback),
  ]);
}
