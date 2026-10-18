import {describe, expect, it} from 'vitest';

import type {PreferenceWeights} from '../../src/engine/taste';
import {scoreTitleForProfile} from '../../src/engine/scoring';
import {makeProfile, makeTitle} from '../helpers';

const title = makeTitle({id: 't', genres: ['comedy', 'family'], popularity: 0.6});

describe('scoreTitleForProfile', () => {
  it('uses popularity as the base score', () => {
    const breakdown = scoreTitleForProfile(title, makeProfile({id: 'p'}));
    expect(breakdown.base).toBe(0.6);
  });

  it('clamps popularity into [0, 1]', () => {
    expect(
      scoreTitleForProfile(makeTitle({id: 'a', popularity: 5}), makeProfile({id: 'p'})).base,
    ).toBe(1);
    expect(
      scoreTitleForProfile(makeTitle({id: 'b', popularity: -5}), makeProfile({id: 'p'})).base,
    ).toBe(0);
    expect(
      scoreTitleForProfile(makeTitle({id: 'c', popularity: Number.NaN}), makeProfile({id: 'p'}))
        .base,
    ).toBe(0);
  });

  it('adds affinity for favourite genres', () => {
    const breakdown = scoreTitleForProfile(
      title,
      makeProfile({id: 'p', favoriteGenres: ['comedy']}),
    );
    expect(breakdown.affinity).toBeCloseTo(0.15);
    expect(breakdown.total).toBeCloseTo(0.75);
  });

  it('penalises avoided genres more than it rewards favourites', () => {
    const breakdown = scoreTitleForProfile(title, makeProfile({id: 'p', avoidGenres: ['family']}));
    expect(breakdown.avoidance).toBeCloseTo(-0.35);
    expect(breakdown.total).toBeCloseTo(0.25);
  });

  it('applies learned genre weights', () => {
    const weights: PreferenceWeights = new Map([['comedy', 1]]);
    const breakdown = scoreTitleForProfile(title, makeProfile({id: 'p'}), weights);
    expect(breakdown.learned).toBeCloseTo(0.4);
  });

  it('falls back to the base score when preferences are missing', () => {
    const breakdown = scoreTitleForProfile(title, makeProfile({id: 'p'}));
    expect(breakdown.affinity).toBeCloseTo(0);
    expect(breakdown.avoidance).toBeCloseTo(0);
    expect(breakdown.learned).toBeCloseTo(0);
    expect(breakdown.total).toBe(breakdown.base);
  });

  it('combines affinity and avoidance when a genre is both', () => {
    const breakdown = scoreTitleForProfile(
      title,
      makeProfile({id: 'p', favoriteGenres: ['comedy'], avoidGenres: ['comedy']}),
    );
    expect(breakdown.affinity).toBeCloseTo(0.15);
    expect(breakdown.avoidance).toBeCloseTo(-0.35);
    expect(breakdown.total).toBeCloseTo(0.6 + 0.15 - 0.35);
  });
});
