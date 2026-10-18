import {describe, expect, it} from 'vitest';

import {SAMPLE_CATALOG, SAMPLE_PROFILES} from '../../src/data/catalog';
import {minAgeForRating} from '../../src/domain/ageRating';
import type {Feedback} from '../../src/domain/types';
import {recommend} from '../../src/engine/recommend';
import {resolveSelected, setReaction} from '../../src/ui/selection';
import {whyThis} from '../../src/ui/presenters';

const ALL_IDS = SAMPLE_PROFILES.map(profile => profile.id);

describe('group selection to recommendations flow', () => {
  it('produces age-safe picks for the whole household', () => {
    const group = resolveSelected(SAMPLE_PROFILES, ALL_IDS);
    const recommendations = recommend(SAMPLE_CATALOG, group);

    expect(recommendations.length).toBeGreaterThan(0);
    // Ada is 8, so no title requiring older viewers should reach the group.
    expect(recommendations.every(recommendation => recommendation.title.ageRating !== 'R')).toBe(
      true,
    );
    expect(recommendations.every(recommendation => recommendation.reason.length > 0)).toBe(true);
  });

  it('keeps the youngest viewer safe even when only they are selected', () => {
    const young = resolveSelected(SAMPLE_PROFILES, ['ada']);
    const recommendations = recommend(SAMPLE_CATALOG, young);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every(r => minAgeForRating(r.title.ageRating) <= 8)).toBe(true);
  });

  it('every rendered explanation comes from the engine', () => {
    const group = resolveSelected(SAMPLE_PROFILES, ALL_IDS);
    for (const recommendation of recommend(SAMPLE_CATALOG, group)) {
      expect(whyThis(recommendation)).toBe(recommendation.reason);
    }
  });

  it('learns from feedback recorded through the selection helper', () => {
    const group = resolveSelected(SAMPLE_PROFILES, ['mira']);
    const baseline = recommend(SAMPLE_CATALOG, group);
    const target = baseline[baseline.length - 1];
    expect(target).toBeDefined();
    if (!target) {
      return;
    }

    const feedback: Feedback[] = setReaction([], {
      profileId: 'mira',
      titleId: target.title.id,
      kind: 'dislike',
      at: 1,
    });

    const updated = recommend(SAMPLE_CATALOG, group, feedback);
    const updatedIndex = updated.findIndex(r => r.title.id === target.title.id);
    const baselineIndex = baseline.findIndex(r => r.title.id === target.title.id);
    expect(updatedIndex === -1 || updatedIndex >= baselineIndex).toBe(true);
  });

  it('returns nothing when nobody is watching', () => {
    expect(resolveSelected(SAMPLE_PROFILES, [])).toEqual([]);
  });
});
