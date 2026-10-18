import {describe, expect, it} from 'vitest';

import type {Feedback, Profile, Title} from '../../src/domain/types';
import {recommend} from '../../src/engine/recommend';
import {makeProfile, makeTitle} from '../helpers';

const adult = makeProfile({id: 'adult', age: 30});

function ids(recommendations: ReturnType<typeof recommend>): string[] {
  return recommendations.map(entry => entry.title.id);
}

describe('recommend - age safety', () => {
  it('never returns a title the youngest viewer cannot watch', () => {
    const titles: Title[] = [
      makeTitle({id: 'safe', ageRating: 'G', popularity: 0.5}),
      makeTitle({id: 'mature', ageRating: 'R', popularity: 1}),
    ];

    const result = recommend(titles, [makeProfile({id: 'kid', age: 8})]);

    expect(ids(result)).toContain('safe');
    expect(ids(result)).not.toContain('mature');
  });

  it('keeps mature titles only when age safety is explicitly bypassed', () => {
    const titles = [makeTitle({id: 'mature', ageRating: 'R'})];
    expect(ids(recommend(titles, [makeProfile({id: 'kid', age: 8})]))).toHaveLength(0);
    expect(
      ids(recommend(titles, [makeProfile({id: 'kid', age: 8})], [], {ignoreAgeSafety: true})),
    ).toEqual(['mature']);
  });
});

describe('recommend - catalog handling', () => {
  it('returns an empty list for an empty catalog', () => {
    expect(recommend([], [adult])).toEqual([]);
  });

  it('removes duplicate titles, keeping the first occurrence', () => {
    const titles = [
      makeTitle({id: 'dup', name: 'first', popularity: 0.9}),
      makeTitle({id: 'dup', name: 'second', popularity: 0.1}),
    ];

    const result = recommend(titles, [adult]);

    expect(result).toHaveLength(1);
    expect(result[0]?.title.name).toBe('first');
  });

  it('honours excludeTitleIds', () => {
    const titles = [makeTitle({id: 'a'}), makeTitle({id: 'b'})];
    const result = recommend(titles, [adult], [], {excludeTitleIds: ['a']});
    expect(ids(result)).toEqual(['b']);
  });

  it('honours the limit', () => {
    const titles = Array.from({length: 5}, (_value, index) => makeTitle({id: `t${index}`}));
    expect(recommend(titles, [adult], [], {limit: 2})).toHaveLength(2);
    expect(recommend(titles, [adult], [], {limit: 0})).toEqual([]);
  });
});

describe('recommend - ranking stability', () => {
  it('breaks ties by catalog order and is deterministic', () => {
    const titles = [makeTitle({id: 'a', popularity: 0.5}), makeTitle({id: 'b', popularity: 0.5})];

    const first = ids(recommend(titles, [adult]));
    const second = ids(recommend(titles, [adult]));

    expect(first).toEqual(['a', 'b']);
    expect(second).toEqual(first);
  });

  it('reports one member score per viewer', () => {
    const profiles: Profile[] = [adult, makeProfile({id: 'teen', age: 15})];
    const result = recommend([makeTitle({id: 't'})], profiles);
    expect(result[0]?.memberScores).toHaveLength(2);
  });
});

describe('recommend - group fairness', () => {
  // x is loved by p1 but disliked by p2; y is liked by both.
  const x = makeTitle({id: 'x', genres: ['horror'], popularity: 1, ageRating: 'R'});
  const y = makeTitle({id: 'y', genres: ['comedy'], popularity: 0.7, ageRating: 'G'});
  const profiles: Profile[] = [
    makeProfile({id: 'p1', age: 30, favoriteGenres: ['horror', 'comedy']}),
    makeProfile({id: 'p2', age: 30, favoriteGenres: ['comedy'], avoidGenres: ['horror']}),
  ];

  it('avoids a title one viewer strongly dislikes (balanced)', () => {
    expect(ids(recommend([x, y], profiles, [], {strategy: 'balanced'}))[0]).toBe('y');
  });

  it('avoids a title one viewer strongly dislikes (least-misery)', () => {
    expect(ids(recommend([x, y], profiles, [], {strategy: 'least-misery'}))[0]).toBe('y');
  });

  it('lets a polarising favourite win under the average strategy', () => {
    expect(ids(recommend([x, y], profiles, [], {strategy: 'average'}))[0]).toBe('x');
  });
});

describe('recommend - feedback learning', () => {
  it('lifts a genre after a like and is a no-op without feedback', () => {
    const drama = makeTitle({id: 'd', genres: ['drama'], popularity: 0.5});
    const comedy = makeTitle({id: 'c', genres: ['comedy'], popularity: 0.5});
    const profiles: Profile[] = [makeProfile({id: 'p', age: 30})];

    expect(ids(recommend([drama, comedy], profiles))).toEqual(['d', 'c']);

    const feedback: Feedback[] = [{profileId: 'p', titleId: 'c', kind: 'like', at: 0}];
    expect(ids(recommend([drama, comedy], profiles, feedback))[0]).toBe('c');
  });
});

describe('recommend - explanations', () => {
  it('explains the recommendation using real factors', () => {
    const result = recommend(
      [makeTitle({id: 't', ageRating: 'PG'})],
      [makeProfile({id: 'kid', age: 10})],
    );

    const reason = result[0]?.reason ?? '';
    expect(reason).toContain('PG');
    expect(reason).toContain('safe for the youngest viewer');
    expect(reason.length).toBeGreaterThan(0);
  });

  it('mentions avoided genres and the weakest fit for a group', () => {
    const title = makeTitle({id: 't', genres: ['horror'], ageRating: 'R'});
    const profiles: Profile[] = [
      makeProfile({id: 'p1', age: 30}),
      makeProfile({id: 'p2', name: 'Sam', age: 30, avoidGenres: ['horror']}),
    ];

    const reason = recommend([title], profiles)[0]?.reason ?? '';
    expect(reason).toContain('Sam avoids horror');
  });
});

describe('recommend - invalid inputs', () => {
  it('throws when there are no profiles', () => {
    expect(() => recommend([], [])).toThrow(/at least one profile/);
  });

  it('throws on an invalid viewer age', () => {
    expect(() => recommend([], [makeProfile({id: 'p', age: -1})])).toThrow(/invalid age/);
  });

  it('throws on duplicate profile ids', () => {
    expect(() => recommend([], [makeProfile({id: 'p'}), makeProfile({id: 'p'})])).toThrow(
      /duplicate profile id/,
    );
  });

  it('throws on an invalid limit', () => {
    expect(() => recommend([], [adult], [], {limit: -1})).toThrow(/limit/);
    expect(() => recommend([], [adult], [], {limit: 1.5})).toThrow(/limit/);
  });

  it('throws when the catalog is not an array', () => {
    expect(() => recommend(undefined as unknown as Title[], [adult])).toThrow(/array/);
  });
});
