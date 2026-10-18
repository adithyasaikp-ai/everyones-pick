import type {GroupStrategy} from '../domain/types';

/**
 * Group aggregation.
 *
 * Input is a matrix indexed as `matrix[candidateIndex][viewerIndex]`. Every
 * strategy returns one aggregate score per candidate, in the same order.
 */

export type ScoreMatrix = readonly (readonly number[])[];

function assertRectangular(matrix: ScoreMatrix): void {
  const first = matrix[0];
  if (first === undefined) {
    return;
  }
  const width = first.length;
  for (const row of matrix) {
    if (row.length !== width) {
      throw new Error('aggregateScores: score matrix rows must have equal length');
    }
  }
}

/** Maximise the worst individual score: nobody gets stuck with a bad pick. */
export function leastMiseryScores(matrix: ScoreMatrix): number[] {
  return matrix.map(row => (row.length === 0 ? 0 : Math.min(...row)));
}

/** Maximise the mean score across viewers. */
export function averageScores(matrix: ScoreMatrix): number[] {
  return matrix.map(row =>
    row.length === 0 ? 0 : row.reduce((sum, value) => sum + value, 0) / row.length,
  );
}

/**
 * Compromise between fairness and overall enjoyment:
 *   score = min(viewers) + BALANCED_MEAN_WEIGHT * mean(viewers)
 * The `min` term ensures no single viewer is badly served; the mean term
 * breaks ties in favour of titles more people enjoy.
 */
export const BALANCED_MEAN_WEIGHT = 0.25;

export function balancedScores(matrix: ScoreMatrix): number[] {
  return matrix.map(row => {
    if (row.length === 0) {
      return 0;
    }
    const worst = Math.min(...row);
    const mean = row.reduce((sum, value) => sum + value, 0) / row.length;
    return worst + BALANCED_MEAN_WEIGHT * mean;
  });
}

/**
 * Borda count: each viewer ranks the candidates and each rank is worth
 * `candidates - 1 - rank` points. Rewards titles that are broadly acceptable
 * even if nobody's absolute favourite. Ties are broken by catalog order so the
 * result is deterministic.
 */
export function bordaScores(matrix: ScoreMatrix): number[] {
  const first = matrix[0];
  if (first === undefined) {
    return [];
  }
  const candidates = matrix.length;
  const viewers = first.length;
  const totals = new Array<number>(candidates).fill(0);

  for (let viewer = 0; viewer < viewers; viewer += 1) {
    const ranking = matrix
      .map((row, index) => ({index, value: row[viewer] ?? 0}))
      .sort((a, b) => b.value - a.value || a.index - b.index);

    ranking.forEach((entry, rank) => {
      totals[entry.index] += candidates - 1 - rank;
    });
  }

  return totals;
}

export function aggregateScores(strategy: GroupStrategy, matrix: ScoreMatrix): number[] {
  assertRectangular(matrix);
  switch (strategy) {
    case 'least-misery':
      return leastMiseryScores(matrix);
    case 'average':
      return averageScores(matrix);
    case 'borda':
      return bordaScores(matrix);
    case 'balanced':
      return balancedScores(matrix);
    default:
      return balancedScores(matrix);
  }
}
