/**
 * Age-rating domain vocabulary.
 *
 * This module is intentionally free of any React Native (or other runtime)
 * dependency so it can be imported and tested in a plain Node process.
 */

export type AgeRating = 'TV-Y' | 'TV-G' | 'TV-PG' | 'TV-14' | 'TV-MA' | 'G' | 'PG' | 'PG-13' | 'R';

/**
 * Minimum viewer age we consider appropriate for each rating.
 * Used as a hard safety gate before any recommendation is made.
 */
export const AGE_RATING_MIN_AGE: Readonly<Record<AgeRating, number>> = {
  'TV-Y': 0,
  'TV-G': 0,
  G: 0,
  'TV-PG': 7,
  PG: 7,
  'PG-13': 13,
  'TV-14': 14,
  R: 17,
  'TV-MA': 17,
};

export function minAgeForRating(rating: AgeRating): number {
  return AGE_RATING_MIN_AGE[rating];
}
