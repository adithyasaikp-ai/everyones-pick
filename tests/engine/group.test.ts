import {describe, expect, it} from 'vitest';

import {
  aggregateScores,
  averageScores,
  balancedScores,
  bordaScores,
  leastMiseryScores,
} from '../../src/engine/group';

// A polarising title (loved by one viewer, disliked by the other) versus a
// broadly acceptable title.
const polarising = [1.15, 0.65];
const broad = [0.85, 0.85];
const matrix = [polarising, broad];

describe('leastMiseryScores', () => {
  it('returns the worst score per candidate', () => {
    expect(leastMiseryScores(matrix)).toEqual([0.65, 0.85]);
  });

  it('returns zero for a candidate with no viewers', () => {
    expect(leastMiseryScores([[]])).toEqual([0]);
  });
});

describe('averageScores', () => {
  it('returns the mean score per candidate', () => {
    const [polarisingMean, broadMean] = averageScores(matrix);
    expect(polarisingMean).toBeCloseTo(0.9);
    expect(broadMean).toBeCloseTo(0.85);
  });
});

describe('balancedScores', () => {
  it('prefers the title that nobody dislikes', () => {
    const [polarisingScore, broadScore] = balancedScores(matrix);
    expect(broadScore).toBeGreaterThan(polarisingScore);
  });
});

describe('bordaScores', () => {
  it('awards points by rank and sums across viewers', () => {
    const scores = bordaScores(matrix);
    expect(scores).toHaveLength(2);
    expect(scores[0]).toBe(scores[1]);
  });

  it('returns an empty array for an empty matrix', () => {
    expect(bordaScores([])).toEqual([]);
  });
});

describe('aggregateScores', () => {
  it('dispatches to the requested strategy', () => {
    expect(aggregateScores('least-misery', matrix)).toEqual(leastMiseryScores(matrix));
    expect(aggregateScores('average', matrix)).toEqual(averageScores(matrix));
    expect(aggregateScores('balanced', matrix)).toEqual(balancedScores(matrix));
    expect(aggregateScores('borda', matrix)).toEqual(bordaScores(matrix));
  });

  it('rejects a ragged matrix', () => {
    expect(() => aggregateScores('balanced', [[1, 2], [3]])).toThrow(/equal length/);
  });

  it('returns an empty array for an empty matrix', () => {
    expect(aggregateScores('balanced', [])).toEqual([]);
  });
});
