import type {Genre, Profile, Title} from '../domain/types';
import type {PreferenceWeights} from './taste';

/**
 * Per-viewer scoring.
 *
 * total = base + affinity - avoidance + learned
 *
 * - base:      the title's global popularity, clamped to [0, 1].
 * - affinity:  +0.15 per genre the viewer marked as a favourite.
 * - avoidance: -0.35 per genre the viewer asked to avoid (a dislike is
 *              weighted more heavily than a favourite, by design).
 * - learned:   0.4 x sum of the viewer's bounded learned weights for the
 *              title's genres (see taste.ts).
 *
 * The breakdown is returned alongside the total so explanations can be built
 * from the real contributions rather than guessed.
 */

export const AFFINITY_WEIGHT = 0.15;
export const AVOIDANCE_PENALTY = 0.35;
export const LEARNED_WEIGHT = 0.4;

export interface ScoreBreakdown {
  readonly base: number;
  readonly affinity: number;
  readonly avoidance: number;
  readonly learned: number;
  readonly total: number;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function countMatches(values: readonly Genre[], targets: readonly Genre[]): number {
  let count = 0;
  for (const value of values) {
    if (targets.includes(value)) {
      count += 1;
    }
  }
  return count;
}

export function scoreTitleForProfile(
  title: Title,
  profile: Profile,
  weights: PreferenceWeights = new Map(),
): ScoreBreakdown {
  const base = clamp01(title.popularity);
  const affinity = AFFINITY_WEIGHT * countMatches(title.genres, profile.favoriteGenres);
  const avoidance = -AVOIDANCE_PENALTY * countMatches(title.genres, profile.avoidGenres);

  let learnedSum = 0;
  for (const genre of title.genres) {
    learnedSum += weights.get(genre) ?? 0;
  }
  const learned = LEARNED_WEIGHT * learnedSum;

  return {base, affinity, avoidance, learned, total: base + affinity + avoidance + learned};
}
