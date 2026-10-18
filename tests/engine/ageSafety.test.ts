import {describe, expect, it} from 'vitest';

import {
  filterTitlesByAge,
  isRatingSafeForAge,
  isRatingSafeForGroup,
  isTitleSafeForGroup,
  youngestViewerAge,
} from '../../src/engine/ageSafety';
import {makeProfile, makeTitle} from '../helpers';

describe('isRatingSafeForAge', () => {
  it('allows family ratings for young children', () => {
    expect(isRatingSafeForAge('G', 3)).toBe(true);
    expect(isRatingSafeForAge('TV-Y', 3)).toBe(true);
    expect(isRatingSafeForAge('TV-G', 3)).toBe(true);
  });

  it('blocks mature ratings for young children', () => {
    expect(isRatingSafeForAge('R', 10)).toBe(false);
    expect(isRatingSafeForAge('TV-MA', 10)).toBe(false);
    expect(isRatingSafeForAge('PG-13', 10)).toBe(false);
  });

  it('allows a rating exactly at its minimum age', () => {
    expect(isRatingSafeForAge('PG', 7)).toBe(true);
    expect(isRatingSafeForAge('PG-13', 13)).toBe(true);
    expect(isRatingSafeForAge('R', 17)).toBe(true);
  });

  it('blocks a rating one year below its minimum age', () => {
    expect(isRatingSafeForAge('PG', 6)).toBe(false);
    expect(isRatingSafeForAge('PG-13', 12)).toBe(false);
    expect(isRatingSafeForAge('R', 16)).toBe(false);
  });
});

describe('isRatingSafeForGroup', () => {
  it('is constrained by the youngest member of the group', () => {
    expect(isRatingSafeForGroup('PG-13', [5, 15, 40])).toBe(false);
    expect(isRatingSafeForGroup('PG', [5, 15, 40])).toBe(false);
    expect(isRatingSafeForGroup('G', [5, 15, 40])).toBe(true);
    expect(isRatingSafeForGroup('PG', [8, 15, 40])).toBe(true);
  });

  it('treats an empty group as unconstrained', () => {
    expect(isRatingSafeForGroup('TV-MA', [])).toBe(true);
  });
});

describe('youngestViewerAge', () => {
  it('returns the smallest age in the group', () => {
    expect(
      youngestViewerAge([makeProfile({id: 'a', age: 40}), makeProfile({id: 'b', age: 7})]),
    ).toBe(7);
  });

  it('returns Infinity for an empty group', () => {
    expect(youngestViewerAge([])).toBe(Infinity);
  });
});

describe('isTitleSafeForGroup', () => {
  it('rejects a title that exceeds the youngest viewer', () => {
    const title = makeTitle({id: 'r', ageRating: 'R'});
    expect(isTitleSafeForGroup(title, [makeProfile({id: 'kid', age: 8})])).toBe(false);
    expect(isTitleSafeForGroup(title, [makeProfile({id: 'adult', age: 30})])).toBe(true);
  });
});

describe('filterTitlesByAge', () => {
  const titles = [
    makeTitle({id: 'g', ageRating: 'G'}),
    makeTitle({id: 'pg', ageRating: 'PG'}),
    makeTitle({id: 'pg13', ageRating: 'PG-13'}),
    makeTitle({id: 'r', ageRating: 'R'}),
  ];

  it('keeps only titles safe for the youngest viewer', () => {
    const kept = filterTitlesByAge(titles, [makeProfile({id: 'kid', age: 10})]);
    expect(kept.map(title => title.id)).toEqual(['g', 'pg']);
  });

  it('keeps everything for a group of adults', () => {
    const kept = filterTitlesByAge(titles, [makeProfile({id: 'adult', age: 30})]);
    expect(kept).toHaveLength(4);
  });
});
