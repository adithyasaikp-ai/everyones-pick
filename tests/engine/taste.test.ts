import {describe, expect, it} from 'vitest';

import type {Feedback, Title} from '../../src/domain/types';
import {MAX_ABS_WEIGHT, boundWeight, buildPreferenceWeights} from '../../src/engine/taste';
import {makeTitle} from '../helpers';

const comedy = makeTitle({id: 'c1', genres: ['comedy']});
const horror = makeTitle({id: 'h1', genres: ['horror']});
const catalog = new Map<string, Title>([
  [comedy.id, comedy],
  [horror.id, horror],
]);

function like(profileId: string, titleId: string): Feedback {
  return {profileId, titleId, kind: 'like', at: 0};
}

function dislike(profileId: string, titleId: string): Feedback {
  return {profileId, titleId, kind: 'dislike', at: 0};
}

describe('boundWeight', () => {
  it('is zero for zero and non-finite input', () => {
    expect(boundWeight(0)).toBe(0);
    expect(boundWeight(Number.NaN)).toBe(0);
    expect(boundWeight(Infinity)).toBe(0);
  });

  it('stays strictly inside the -1..1 bound', () => {
    expect(boundWeight(1_000_000)).toBeLessThan(MAX_ABS_WEIGHT);
    expect(boundWeight(-1_000_000)).toBeGreaterThan(-MAX_ABS_WEIGHT);
  });
});

describe('buildPreferenceWeights', () => {
  it('returns an empty map when there is no feedback', () => {
    expect(buildPreferenceWeights('p1', [], catalog).size).toBe(0);
  });

  it('raises the weight of a liked genre', () => {
    const weights = buildPreferenceWeights('p1', [like('p1', comedy.id)], catalog);
    expect(weights.get('comedy')).toBeGreaterThan(0);
  });

  it('lowers the weight of a disliked genre', () => {
    const weights = buildPreferenceWeights('p1', [dislike('p1', horror.id)], catalog);
    expect(weights.get('horror')).toBeLessThan(0);
  });

  it('ignores feedback belonging to other profiles', () => {
    const weights = buildPreferenceWeights('p1', [like('p2', comedy.id)], catalog);
    expect(weights.size).toBe(0);
  });

  it('ignores feedback for titles that are not in the catalog', () => {
    const weights = buildPreferenceWeights('p1', [like('p1', 'missing')], catalog);
    expect(weights.size).toBe(0);
  });

  it('keeps weights bounded even after many reactions', () => {
    const manyLikes: Feedback[] = Array.from({length: 100}, () => like('p1', comedy.id));
    const manyDislikes: Feedback[] = Array.from({length: 100}, () => dislike('p1', horror.id));

    const liked = buildPreferenceWeights('p1', manyLikes, catalog).get('comedy') ?? 0;
    const disliked = buildPreferenceWeights('p1', manyDislikes, catalog).get('horror') ?? 0;

    expect(liked).toBeGreaterThan(0);
    expect(liked).toBeLessThan(MAX_ABS_WEIGHT);
    expect(disliked).toBeLessThan(0);
    expect(disliked).toBeGreaterThan(-MAX_ABS_WEIGHT);
  });
});
