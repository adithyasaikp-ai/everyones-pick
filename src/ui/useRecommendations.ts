import {useMemo} from 'react';

import {SAMPLE_CATALOG} from '../data/catalog';
import type {Feedback, Profile, Recommendation} from '../domain/types';
import {recommend} from '../engine/recommend';
import {errorMessage} from './presenters';

export interface RecommendationResult {
  readonly recommendations: readonly Recommendation[];
  readonly error?: string;
}

/**
 * Runs the existing engine over the catalog for the selected group. Returns an
 * empty list (and no error) when nobody is selected, and captures engine errors
 * instead of throwing inside render.
 */
export function useRecommendations(
  profiles: readonly Profile[],
  feedback: readonly Feedback[],
): RecommendationResult {
  return useMemo<RecommendationResult>(() => {
    if (profiles.length === 0) {
      return {recommendations: []};
    }
    try {
      return {recommendations: recommend(SAMPLE_CATALOG, profiles, feedback)};
    } catch (cause) {
      return {recommendations: [], error: errorMessage(cause)};
    }
  }, [profiles, feedback]);
}
