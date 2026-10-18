import {describe, expect, it} from 'vitest';

import type {Feedback} from '../../src/domain/types';
import {
  clearReaction,
  reactionOf,
  resolveSelected,
  setReaction,
  toggleMember,
  toggleReaction,
} from '../../src/ui/selection';

const ada = {id: 'ada', name: 'Ada'};
const noah = {id: 'noah', name: 'Noah'};
const mira = {id: 'mira', name: 'Mira'};

describe('toggleMember', () => {
  it('adds an unselected member', () => {
    expect(toggleMember(['ada'], 'noah')).toEqual(['ada', 'noah']);
  });

  it('removes an already selected member', () => {
    expect(toggleMember(['ada', 'noah'], 'ada')).toEqual(['noah']);
  });

  it('does not mutate the input', () => {
    const selected = ['ada'];
    toggleMember(selected, 'noah');
    expect(selected).toEqual(['ada']);
  });
});

describe('resolveSelected', () => {
  it('returns profiles in their original order, not selection order', () => {
    expect(resolveSelected([ada, noah, mira], ['mira', 'ada'])).toEqual([ada, mira]);
  });

  it('ignores ids with no matching profile', () => {
    expect(resolveSelected([ada, noah], ['noah', 'ghost'])).toEqual([noah]);
  });
});

describe('reactions', () => {
  const base: Feedback = {profileId: 'ada', titleId: 'lantern-keepers', kind: 'like', at: 1};

  it('looks up an existing reaction', () => {
    expect(reactionOf([base], 'ada', 'lantern-keepers')).toBe('like');
    expect(reactionOf([base], 'noah', 'lantern-keepers')).toBeUndefined();
  });

  it('replaces an existing reaction for the same profile and title', () => {
    const next = setReaction([base], {
      profileId: 'ada',
      titleId: 'lantern-keepers',
      kind: 'dislike',
      at: 2,
    });
    expect(next).toHaveLength(1);
    expect(next[0]).toEqual({
      profileId: 'ada',
      titleId: 'lantern-keepers',
      kind: 'dislike',
      at: 2,
    });
  });

  it('keeps other profiles unaffected when setting a reaction', () => {
    const other: Feedback = {profileId: 'noah', titleId: 'lantern-keepers', kind: 'like', at: 1};
    const next = setReaction([base, other], {
      profileId: 'ada',
      titleId: 'lantern-keepers',
      kind: 'dislike',
      at: 3,
    });
    expect(next).toHaveLength(2);
    expect(next).toContainEqual(other);
  });

  it('clears a reaction', () => {
    expect(clearReaction([base], 'ada', 'lantern-keepers')).toEqual([]);
  });

  it('toggles a reaction off when the same kind is chosen again', () => {
    expect(
      toggleReaction([base], {profileId: 'ada', titleId: 'lantern-keepers', kind: 'like', at: 5}),
    ).toEqual([]);
  });

  it('toggles a reaction on when a different kind is chosen', () => {
    const next = toggleReaction([base], {
      profileId: 'ada',
      titleId: 'lantern-keepers',
      kind: 'dislike',
      at: 5,
    });
    expect(next).toEqual([{profileId: 'ada', titleId: 'lantern-keepers', kind: 'dislike', at: 5}]);
  });
});
