import type {AgeRating} from './ageRating';

/**
 * Core domain vocabulary for Everyone's Pick.
 *
 * These types are deliberately free of any React Native (or other runtime)
 * dependency so the recommendation engine can be exercised in a plain Node
 * process.
 */

export type Genre =
  | 'action'
  | 'adventure'
  | 'animation'
  | 'comedy'
  | 'documentary'
  | 'drama'
  | 'family'
  | 'fantasy'
  | 'horror'
  | 'musical'
  | 'mystery'
  | 'romance'
  | 'sci-fi'
  | 'thriller';

export const GENRES: readonly Genre[] = [
  'action',
  'adventure',
  'animation',
  'comedy',
  'documentary',
  'drama',
  'family',
  'fantasy',
  'horror',
  'musical',
  'mystery',
  'romance',
  'sci-fi',
  'thriller',
];

/** A single person watching tonight. */
export interface Profile {
  readonly id: string;
  readonly name: string;
  /** Age in years; drives the hard age-safety filter. */
  readonly age: number;
  readonly favoriteGenres: readonly Genre[];
  readonly avoidGenres: readonly Genre[];
}

/** A watchable item in the catalog. */
export interface Title {
  readonly id: string;
  readonly name: string;
  readonly year: number;
  readonly runtimeMinutes: number;
  readonly ageRating: AgeRating;
  readonly genres: readonly Genre[];
  /** Baseline quality/popularity in the closed interval [0, 1]. */
  readonly popularity: number;
  /** Short original description; not sourced from any provider. */
  readonly synopsis?: string;
  /**
   * Whether the metadata (rating, year, runtime, popularity) has been checked
   * against an authoritative source. Demo/sample data sets this to `false`.
   */
  readonly metadataVerified?: boolean;
}

export type FeedbackKind = 'like' | 'dislike';

/** A single reaction to a title by one profile. */
export interface Feedback {
  readonly profileId: string;
  readonly titleId: string;
  readonly kind: FeedbackKind;
  /** Creation time (ms since epoch); retained for ordering and display. */
  readonly at: number;
}

/** Per-viewer score attached to a recommendation, for transparency. */
export interface MemberScore {
  readonly profileId: string;
  readonly score: number;
}

/**
 * How per-viewer scores are combined for a group:
 * - `balanced` (default): rewards titles the least-happy viewer still likes.
 * - `least-misery`: maximises the worst individual score.
 * - `average`: maximises the mean score.
 * - `borda`: rank-based fairness across viewers.
 */
export type GroupStrategy = 'balanced' | 'borda' | 'least-misery' | 'average';

export interface Recommendation {
  readonly title: Title;
  readonly score: number;
  readonly strategy: GroupStrategy;
  readonly memberScores: readonly MemberScore[];
  /** Human-readable justification derived from the real scoring factors. */
  readonly reason: string;
}

export interface RecommendOptions {
  /** Maximum number of recommendations to return. Defaults to 10. */
  readonly limit?: number;
  /** Group aggregation strategy. Defaults to `balanced`. */
  readonly strategy?: GroupStrategy;
  /** Title ids to omit (for example, already watched tonight). */
  readonly excludeTitleIds?: readonly string[];
  /** Test/admin escape hatch that bypasses the age-safety filter. */
  readonly ignoreAgeSafety?: boolean;
}
