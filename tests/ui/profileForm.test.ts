import {describe, expect, it} from 'vitest';

import type {Genre} from '../../src/domain/types';
import {createProfileId, emptyDraft, toggleGenre, validateDraft} from '../../src/ui/profileForm';

describe('emptyDraft', () => {
  it('starts blank with no genres', () => {
    expect(emptyDraft()).toEqual({name: '', age: '', favoriteGenres: [], avoidGenres: []});
  });
});

describe('toggleGenre', () => {
  it('adds a genre that is not present', () => {
    expect(toggleGenre([], 'comedy')).toEqual(['comedy']);
  });

  it('removes a genre that is present', () => {
    const genres: Genre[] = ['comedy', 'drama'];
    expect(toggleGenre(genres, 'comedy')).toEqual(['drama']);
  });

  it('does not mutate the input', () => {
    const genres: Genre[] = ['comedy'];
    toggleGenre(genres, 'drama');
    expect(genres).toEqual(['comedy']);
  });
});

describe('validateDraft', () => {
  it('accepts a complete draft and trims the name', () => {
    const result = validateDraft({
      name: '  Ada  ',
      age: '8',
      favoriteGenres: ['animation'],
      avoidGenres: ['horror'],
    });
    expect(result).toEqual({
      ok: true,
      value: {name: 'Ada', age: 8, favoriteGenres: ['animation'], avoidGenres: ['horror']},
    });
  });

  it('requires a name', () => {
    const result = validateDraft({...emptyDraft(), name: '   ', age: '10'});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('Please enter a name.');
    }
  });

  it('requires an age', () => {
    const result = validateDraft({...emptyDraft(), name: 'Ada'});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('Please enter an age.');
    }
  });

  it('rejects a non-integer age', () => {
    const result = validateDraft({...emptyDraft(), name: 'Ada', age: '8.5'});
    expect(result.ok).toBe(false);
  });

  it('rejects an out-of-range age', () => {
    expect(validateDraft({...emptyDraft(), name: 'Ada', age: '-1'}).ok).toBe(false);
    expect(validateDraft({...emptyDraft(), name: 'Ada', age: '121'}).ok).toBe(false);
  });

  it('reports every problem at once', () => {
    const result = validateDraft(emptyDraft());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(2);
    }
  });

  it('copies the genre lists rather than returning the draft arrays', () => {
    const draft = {...emptyDraft(), name: 'Ada', age: '8', favoriteGenres: ['comedy'] as const};
    const result = validateDraft(draft);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.favoriteGenres).toEqual(['comedy']);
      expect(result.value.favoriteGenres).not.toBe(draft.favoriteGenres);
    }
  });
});

describe('createProfileId', () => {
  it('slugifies the name', () => {
    expect(createProfileId([], 'Ada Lovelace')).toBe('ada-lovelace');
  });

  it('collapses punctuation and trims separators', () => {
    expect(createProfileId([], '  Sam!! ')).toBe('sam');
  });

  it('falls back to a generic id for an unusable name', () => {
    expect(createProfileId([], '!!!')).toBe('viewer');
  });

  it('appends a numeric suffix on collision', () => {
    expect(createProfileId(['sam', 'sam-2'], 'Sam')).toBe('sam-3');
  });
});
