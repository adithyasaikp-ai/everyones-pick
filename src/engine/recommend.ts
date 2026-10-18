import {minAgeForRating} from '../domain/ageRating';
import type {
  Feedback,
  Genre,
  GroupStrategy,
  MemberScore,
  Profile,
  Recommendation,
  RecommendOptions,
  Title,
} from '../domain/types';
import {filterTitlesByAge, youngestViewerAge} from './ageSafety';
import {aggregateScores} from './group';
import {scoreTitleForProfile, type ScoreBreakdown} from './scoring';
import {buildPreferenceWeights} from './taste';

export const DEFAULT_LIMIT = 10;
export const DEFAULT_STRATEGY: GroupStrategy = 'balanced';

const LEARNED_EPSILON = 1e-9;

interface ScoredCandidate {
  readonly title: Title;
  readonly index: number;
  readonly score: number;
  readonly memberScores: readonly MemberScore[];
  readonly breakdowns: readonly ScoreBreakdown[];
}

/**
 * Produce a group-balanced, age-safe ranked list of recommendations.
 *
 * Pipeline:
 *   1. validate inputs
 *   2. de-duplicate titles by id (keeping first occurrence)
 *   3. hard age filter against the youngest viewer
 *   4. drop excluded titles
 *   5. score each candidate for every viewer (with learned weights)
 *   6. aggregate per-viewer scores with the chosen group strategy
 *   7. sort (stable, tie-broken by catalog order) and take `limit`
 */
export function recommend(
  titles: readonly Title[],
  profiles: readonly Profile[],
  feedback: readonly Feedback[] = [],
  options: RecommendOptions = {},
): Recommendation[] {
  validateInputs(titles, profiles, options);

  const limit = options.limit ?? DEFAULT_LIMIT;
  const strategy = options.strategy ?? DEFAULT_STRATEGY;

  const uniqueTitles = dedupeById(titles);
  const titlesById = new Map(uniqueTitles.map(title => [title.id, title]));

  const excluded = new Set(options.excludeTitleIds ?? []);
  const ageSafe = options.ignoreAgeSafety
    ? uniqueTitles
    : filterTitlesByAge(uniqueTitles, profiles);
  const candidates = ageSafe.filter(title => !excluded.has(title.id));

  if (candidates.length === 0) {
    return [];
  }

  const weightsByProfile = new Map(
    profiles.map(profile => [profile.id, buildPreferenceWeights(profile.id, feedback, titlesById)]),
  );

  const scored: ScoredCandidate[] = candidates.map((title, index) => {
    const breakdowns = profiles.map(profile =>
      scoreTitleForProfile(title, profile, weightsByProfile.get(profile.id)),
    );
    return {
      title,
      index,
      score: 0,
      memberScores: breakdowns.map((breakdown, member) => ({
        profileId: profiles[member]?.id ?? '',
        score: round(breakdown.total),
      })),
      breakdowns,
    };
  });

  const matrix = scored.map(candidate => candidate.breakdowns.map(breakdown => breakdown.total));
  const aggregate = aggregateScores(strategy, matrix);

  const ranked = scored.map((candidate, index) => ({
    ...candidate,
    score: aggregate[index] ?? 0,
  }));

  ranked.sort((a, b) => b.score - a.score || a.index - b.index);

  const ceiling = youngestViewerAge(profiles);

  return ranked.slice(0, limit).map(candidate => ({
    title: candidate.title,
    score: round(candidate.score),
    strategy,
    memberScores: candidate.memberScores,
    reason: buildReason(candidate.title, profiles, candidate.breakdowns, ceiling),
  }));
}

function buildReason(
  title: Title,
  profiles: readonly Profile[],
  breakdowns: readonly ScoreBreakdown[],
  ceiling: number,
): string {
  const parts: string[] = [];

  if (Number.isFinite(ceiling) && minAgeForRating(title.ageRating) <= ceiling) {
    parts.push(`Rated ${title.ageRating}, safe for the youngest viewer (age ${ceiling})`);
  } else {
    parts.push(`Rated ${title.ageRating}`);
  }

  const favored = new Set<Genre>();
  const avoided = new Set<string>();
  profiles.forEach(profile => {
    for (const genre of title.genres) {
      if (profile.favoriteGenres.includes(genre)) {
        favored.add(genre);
      }
      if (profile.avoidGenres.includes(genre)) {
        avoided.add(`${profile.name} avoids ${genre}`);
      }
    }
  });
  if (favored.size > 0) {
    parts.push(`matches favourite genres: ${[...favored].join(', ')}`);
  }
  if (avoided.size > 0) {
    parts.push([...avoided].join('; '));
  }

  const learnedTotal = breakdowns.reduce((sum, breakdown) => sum + breakdown.learned, 0);
  if (learnedTotal > LEARNED_EPSILON) {
    parts.push('boosted by past likes');
  } else if (learnedTotal < -LEARNED_EPSILON) {
    parts.push('pushed down by past dislikes');
  }

  if (profiles.length > 1 && breakdowns.length === profiles.length) {
    let worstIndex = 0;
    breakdowns.forEach((breakdown, index) => {
      const worst = breakdowns[worstIndex];
      if (worst !== undefined && breakdown.total < worst.total) {
        worstIndex = index;
      }
    });
    const worstProfile = profiles[worstIndex];
    if (worstProfile !== undefined) {
      parts.push(`weakest fit: ${worstProfile.name}`);
    }
  }

  return parts.join(' · ');
}

function dedupeById(titles: readonly Title[]): Title[] {
  const seen = new Set<string>();
  const result: Title[] = [];
  for (const title of titles) {
    if (seen.has(title.id)) {
      continue;
    }
    seen.add(title.id);
    result.push(title);
  }
  return result;
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function validateInputs(
  titles: readonly Title[],
  profiles: readonly Profile[],
  options: RecommendOptions,
): void {
  if (!Array.isArray(titles)) {
    throw new Error('recommend: titles must be an array');
  }
  if (!Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('recommend: at least one profile is required');
  }

  const seen = new Set<string>();
  for (const profile of profiles) {
    if (!Number.isFinite(profile.age) || profile.age < 0) {
      throw new Error(`recommend: profile "${profile.id}" has an invalid age`);
    }
    if (seen.has(profile.id)) {
      throw new Error(`recommend: duplicate profile id "${profile.id}"`);
    }
    seen.add(profile.id);
  }

  if (options.limit !== undefined) {
    if (!Number.isInteger(options.limit) || options.limit < 0) {
      throw new Error('recommend: limit must be a non-negative integer');
    }
  }
}
