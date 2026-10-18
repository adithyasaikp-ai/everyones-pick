import {describe, expect, it} from 'vitest';

import {AGE_RATING_MIN_AGE} from '../../src/domain/ageRating';
import {GENRES} from '../../src/domain/types';
import {CATALOG_DISCLAIMER, SAMPLE_CATALOG, SAMPLE_PROFILES} from '../../src/data/catalog';

describe('sample catalog integrity', () => {
  it('is a useful size', () => {
    expect(SAMPLE_CATALOG.length).toBeGreaterThanOrEqual(10);
  });

  it('has unique ids', () => {
    const ids = SAMPLE_CATALOG.map(title => title.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses only known genres and age ratings', () => {
    for (const title of SAMPLE_CATALOG) {
      for (const genre of title.genres) {
        expect(GENRES).toContain(genre);
      }
      expect(AGE_RATING_MIN_AGE).toHaveProperty(title.ageRating);
    }
  });

  it('has plausible, self-consistent numeric metadata', () => {
    for (const title of SAMPLE_CATALOG) {
      expect(title.popularity).toBeGreaterThanOrEqual(0);
      expect(title.popularity).toBeLessThanOrEqual(1);
      expect(Number.isInteger(title.runtimeMinutes)).toBe(true);
      expect(title.runtimeMinutes).toBeGreaterThan(0);
      expect(title.year).toBeGreaterThan(1900);
      expect(title.year).toBeLessThan(2100);
      expect(title.genres.length).toBeGreaterThan(0);
    }
  });

  it('marks every demo title as unverified', () => {
    for (const title of SAMPLE_CATALOG) {
      expect(title.metadataVerified).toBe(false);
    }
  });

  it('makes no licensing, source or streaming-URL claims', () => {
    const forbidden = ['url', 'streamUrl', 'watchUrl', 'license', 'source', 'provider'];
    for (const title of SAMPLE_CATALOG) {
      const keys = Object.keys(title);
      for (const key of forbidden) {
        expect(keys).not.toContain(key);
      }
    }
  });

  it('ships a non-empty disclaimer', () => {
    expect(CATALOG_DISCLAIMER.length).toBeGreaterThan(0);
  });
});

describe('sample profiles', () => {
  it('uses unique ids and known genres', () => {
    const ids = SAMPLE_PROFILES.map(profile => profile.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const profile of SAMPLE_PROFILES) {
      expect(profile.age).toBeGreaterThanOrEqual(0);
      for (const genre of [...profile.favoriteGenres, ...profile.avoidGenres]) {
        expect(GENRES).toContain(genre);
      }
    }
  });
});
