import type {Feedback, Genre, Title} from '../domain/types';

/**
 * Bounded preference model learned from feedback.
 *
 * Each `like` adds +1 and each `dislike` adds -1 to the raw weight of every
 * genre on the reacted title. Raw weights are then squashed with `tanh`, so a
 * single viewer's learned preference is always strictly inside (-1, 1). This
 * keeps a long feedback history from dominating the base score and prevents
 * runaway preferences.
 */

/** Controls how quickly raw weights saturate towards +/-1. */
export const PREFERENCE_SCALE = 2;

export const MAX_ABS_WEIGHT = 1;

const LIMIT = MAX_ABS_WEIGHT - 1e-6;

/** Squash an unbounded raw weight into the open interval (-1, 1). */
export function boundWeight(raw: number): number {
  if (!Number.isFinite(raw)) {
    return 0;
  }
  return Math.max(-LIMIT, Math.min(LIMIT, Math.tanh(raw / PREFERENCE_SCALE)));
}

export type PreferenceWeights = ReadonlyMap<Genre, number>;

/**
 * Build the bounded genre weights for one profile from their feedback.
 *
 * Feedback from other profiles is ignored. Feedback referencing a title that
 * is not in `titlesById` is ignored rather than throwing.
 */
export function buildPreferenceWeights(
  profileId: string,
  feedback: readonly Feedback[],
  titlesById: ReadonlyMap<string, Title>,
): Map<Genre, number> {
  const raw = new Map<Genre, number>();

  for (const entry of feedback) {
    if (entry.profileId !== profileId) {
      continue;
    }
    const title = titlesById.get(entry.titleId);
    if (title === undefined) {
      continue;
    }
    const delta = entry.kind === 'like' ? 1 : -1;
    for (const genre of title.genres) {
      raw.set(genre, (raw.get(genre) ?? 0) + delta);
    }
  }

  const weights = new Map<Genre, number>();
  for (const [genre, value] of raw) {
    weights.set(genre, boundWeight(value));
  }
  return weights;
}
