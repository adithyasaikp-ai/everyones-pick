import {minAgeForRating, type AgeRating} from '../domain/ageRating';
import type {Profile, Title} from '../domain/types';

/**
 * Age-safety gate for the recommendation engine.
 *
 * The engine must never surface a title that is not appropriate for every
 * member of the viewing group. This module is pure TypeScript and contains no
 * React Native imports, so it can be unit-tested in isolation.
 */

export function isRatingSafeForAge(rating: AgeRating, age: number): boolean {
  return minAgeForRating(rating) <= age;
}

/**
 * True when a title's rating is appropriate for the most age-sensitive member
 * of the group. An empty group is treated as unconstrained.
 */
export function isRatingSafeForGroup(rating: AgeRating, ages: readonly number[]): boolean {
  if (ages.length === 0) {
    return true;
  }
  return isRatingSafeForAge(rating, Math.min(...ages));
}

/**
 * The age of the most age-sensitive viewer. Returns `Infinity` for an empty
 * group so callers can treat it as "no constraint".
 */
export function youngestViewerAge(profiles: readonly Profile[]): number {
  return profiles.reduce((min, profile) => (profile.age < min ? profile.age : min), Infinity);
}

/** True when every viewer in the group is old enough for the title. */
export function isTitleSafeForGroup(title: Title, profiles: readonly Profile[]): boolean {
  if (profiles.length === 0) {
    return true;
  }
  return isRatingSafeForAge(title.ageRating, youngestViewerAge(profiles));
}

/** Hard filter: drop any title the youngest viewer is not old enough for. */
export function filterTitlesByAge(titles: readonly Title[], profiles: readonly Profile[]): Title[] {
  return titles.filter(title => isTitleSafeForGroup(title, profiles));
}
