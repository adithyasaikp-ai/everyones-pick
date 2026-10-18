import {minAgeForRating} from '../domain/ageRating';
import type {Genre, MemberScore, Profile, Recommendation, Title} from '../domain/types';

/**
 * Pure presentation helpers. These turn domain objects into the strings and
 * labels the screens render, without depending on React Native, so they can be
 * unit-tested directly.
 */

export function formatRuntime(minutes: number): string {
  const safe = Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : 0;
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function genreLabel(genres: readonly Genre[]): string {
  return genres.length === 0 ? 'Uncategorised' : genres.join(' · ');
}

/** A local suitability description — not an official certification. */
export function ageSuitabilityLabel(title: Title): string {
  const minAge = minAgeForRating(title.ageRating);
  const audience = minAge === 0 ? 'suitable for all ages' : `recommended for ages ${minAge}+`;
  return `Rated ${title.ageRating} · ${audience}`;
}

export function isMetadataUnverified(title: Title): boolean {
  return title.metadataVerified !== true;
}

export function metadataNotice(title: Title): string | undefined {
  return isMetadataUnverified(title)
    ? 'Unverified metadata: rating, year and runtime are local demo estimates, not official figures.'
    : undefined;
}

export function synopsisText(title: Title): string {
  const synopsis = title.synopsis?.trim();
  return synopsis && synopsis.length > 0 ? synopsis : 'No description available.';
}

/** The engine's explanation, with a safe fallback if it is ever empty. */
export function whyThis(recommendation: Recommendation): string {
  const reason = recommendation.reason.trim();
  return reason.length > 0 ? reason : 'Recommended by the group-balancing engine.';
}

export function memberScoreLabel(member: MemberScore, profiles: readonly Profile[]): string {
  const profile = profiles.find(entry => entry.id === member.profileId);
  const name = profile?.name ?? member.profileId;
  return `${name}: ${member.score.toFixed(2)}`;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  return 'Something went wrong.';
}
