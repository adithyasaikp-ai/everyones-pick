import {describe, expect, it, vi} from 'vitest';

import type {Feedback} from '../../src/domain/types';
import {
  STORAGE_KEYS,
  clearStoredData,
  loadAppState,
  loadFeedback,
  loadProfiles,
  saveFeedback,
  saveProfiles,
} from '../../src/state/persistence';
import {createMemoryStore, type KeyValueStore} from '../../src/state/store';
import {makeProfile} from '../helpers';

const ada = makeProfile({id: 'ada', name: 'Ada', age: 8, favoriteGenres: ['family']});
const noah = makeProfile({id: 'noah', name: 'Noah', age: 14, avoidGenres: ['horror']});

const like: Feedback = {profileId: 'ada', titleId: 'lantern-keepers', kind: 'like', at: 1000};
const dislike: Feedback = {profileId: 'noah', titleId: 'hollow-pines', kind: 'dislike', at: 2000};

describe('profiles persistence', () => {
  it('round-trips profiles', async () => {
    const store = createMemoryStore();
    await saveProfiles(store, [ada, noah]);
    await expect(loadProfiles(store)).resolves.toEqual([ada, noah]);
  });

  it('returns an empty list for empty storage', async () => {
    await expect(loadProfiles(createMemoryStore())).resolves.toEqual([]);
  });

  it('returns an empty list for malformed JSON and reports the error', async () => {
    const store = createMemoryStore({[STORAGE_KEYS.profiles]: '{not json'});
    const onError = vi.fn();
    await expect(loadProfiles(store, {onError})).resolves.toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('returns an empty list for an unrecognized payload shape', async () => {
    const store = createMemoryStore({[STORAGE_KEYS.profiles]: JSON.stringify({nope: true})});
    const onError = vi.fn();
    await expect(loadProfiles(store, {onError})).resolves.toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('accepts a bare legacy array payload', async () => {
    const store = createMemoryStore({[STORAGE_KEYS.profiles]: JSON.stringify([ada])});
    await expect(loadProfiles(store)).resolves.toEqual([ada]);
  });

  it('accepts a versioned envelope from a newer version', async () => {
    const store = createMemoryStore({
      [STORAGE_KEYS.profiles]: JSON.stringify({version: 999, data: [ada]}),
    });
    await expect(loadProfiles(store)).resolves.toEqual([ada]);
  });

  it('filters invalid entries and keeps the valid ones', async () => {
    const store = createMemoryStore({
      [STORAGE_KEYS.profiles]: JSON.stringify([
        null,
        'nope',
        {name: 'missing id', age: 10},
        {id: 'bad-age', age: -3},
        ada,
      ]),
    });
    await expect(loadProfiles(store)).resolves.toEqual([ada]);
  });

  it('drops unknown genres and de-duplicates favourite genres', async () => {
    const store = createMemoryStore({
      [STORAGE_KEYS.profiles]: JSON.stringify([
        {id: 'p', name: 'P', age: 10, favoriteGenres: ['comedy', 'not-a-genre', 42, 'comedy']},
      ]),
    });
    const [profile] = await loadProfiles(store);
    expect(profile?.favoriteGenres).toEqual(['comedy']);
  });

  it('de-duplicates profiles by id, keeping the first', async () => {
    const first = makeProfile({id: 'dup', name: 'first', age: 10});
    const second = makeProfile({id: 'dup', name: 'second', age: 20});
    const store = createMemoryStore({[STORAGE_KEYS.profiles]: JSON.stringify([first, second])});
    const profiles = await loadProfiles(store);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]?.name).toBe('first');
  });

  it('falls back to the id when the stored name is missing', async () => {
    const store = createMemoryStore({
      [STORAGE_KEYS.profiles]: JSON.stringify([{id: 'solo', age: 10}]),
    });
    const [profile] = await loadProfiles(store);
    expect(profile?.name).toBe('solo');
    expect(profile?.favoriteGenres).toEqual([]);
  });

  it('returns an empty list when the store rejects, and reports the error', async () => {
    const onError = vi.fn();
    const failing: KeyValueStore = {
      getItem: () => Promise.reject(new Error('boom')),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };

    await expect(loadProfiles(failing, {onError})).resolves.toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('propagates write failures', async () => {
    const failing: KeyValueStore = {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.reject(new Error('disk full')),
      removeItem: () => Promise.resolve(),
    };
    await expect(saveProfiles(failing, [ada])).rejects.toThrow('disk full');
  });
});

describe('feedback persistence', () => {
  it('round-trips feedback', async () => {
    const store = createMemoryStore();
    await saveFeedback(store, [like, dislike]);
    await expect(loadFeedback(store)).resolves.toEqual([like, dislike]);
  });

  it('returns an empty list for empty storage', async () => {
    await expect(loadFeedback(createMemoryStore())).resolves.toEqual([]);
  });

  it('filters malformed feedback entries', async () => {
    const store = createMemoryStore({
      [STORAGE_KEYS.feedback]: JSON.stringify([
        like,
        {profileId: 'ada', titleId: 'x', kind: 'meh'},
        {profileId: '', titleId: 'x', kind: 'like'},
        {titleId: 'x', kind: 'like'},
      ]),
    });
    await expect(loadFeedback(store)).resolves.toEqual([like]);
  });

  it('defaults a missing timestamp to zero', async () => {
    const store = createMemoryStore({
      [STORAGE_KEYS.feedback]: JSON.stringify([{profileId: 'ada', titleId: 'x', kind: 'like'}]),
    });
    const [entry] = await loadFeedback(store);
    expect(entry?.at).toBe(0);
  });
});

describe('app state and clearing', () => {
  it('loads profiles and feedback together', async () => {
    const store = createMemoryStore();
    await saveProfiles(store, [ada]);
    await saveFeedback(store, [like]);
    await expect(loadAppState(store)).resolves.toEqual({profiles: [ada], feedback: [like]});
  });

  it('clears stored data', async () => {
    const store = createMemoryStore();
    await saveProfiles(store, [ada]);
    await saveFeedback(store, [like]);
    await clearStoredData(store);
    await expect(loadAppState(store)).resolves.toEqual({profiles: [], feedback: []});
  });
});

describe('createMemoryStore', () => {
  it('returns null for a missing key', async () => {
    await expect(createMemoryStore().getItem('missing')).resolves.toBeNull();
  });

  it('stores and removes values', async () => {
    const store = createMemoryStore();
    await store.setItem('k', 'v');
    await expect(store.getItem('k')).resolves.toBe('v');
    await store.removeItem('k');
    await expect(store.getItem('k')).resolves.toBeNull();
  });
});
