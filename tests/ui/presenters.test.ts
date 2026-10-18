import {describe, expect, it} from 'vitest';

import {
  ageSuitabilityLabel,
  errorMessage,
  formatRuntime,
  genreLabel,
  isMetadataUnverified,
  memberScoreLabel,
  metadataNotice,
  synopsisText,
  whyThis,
} from '../../src/ui/presenters';
import {makeProfile, makeTitle} from '../helpers';

describe('formatRuntime', () => {
  it('formats sub-hour runtimes in minutes', () => {
    expect(formatRuntime(45)).toBe('45m');
  });

  it('formats whole hours', () => {
    expect(formatRuntime(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatRuntime(134)).toBe('2h 14m');
  });

  it('rounds fractional minutes', () => {
    expect(formatRuntime(90.6)).toBe('1h 31m');
  });

  it('treats invalid or non-positive values as zero', () => {
    expect(formatRuntime(0)).toBe('0m');
    expect(formatRuntime(-5)).toBe('0m');
    expect(formatRuntime(Number.NaN)).toBe('0m');
  });
});

describe('genreLabel', () => {
  it('joins genres with a separator', () => {
    expect(genreLabel(['comedy', 'family'])).toBe('comedy · family');
  });

  it('labels an empty list', () => {
    expect(genreLabel([])).toBe('Uncategorised');
  });
});

describe('ageSuitabilityLabel', () => {
  it('describes an all-ages rating', () => {
    const title = makeTitle({id: 't', ageRating: 'G'});
    expect(ageSuitabilityLabel(title)).toBe('Rated G · suitable for all ages');
  });

  it('describes an age-gated rating', () => {
    const title = makeTitle({id: 't', ageRating: 'PG-13'});
    expect(ageSuitabilityLabel(title)).toBe('Rated PG-13 · recommended for ages 13+');
  });
});

describe('metadata notices', () => {
  it('flags unverified metadata', () => {
    const title = makeTitle({id: 't', metadataVerified: false});
    expect(isMetadataUnverified(title)).toBe(true);
    expect(metadataNotice(title)).toContain('Unverified metadata');
  });

  it('treats a missing flag as unverified', () => {
    expect(isMetadataUnverified(makeTitle({id: 't'}))).toBe(true);
  });

  it('stays quiet for verified metadata', () => {
    const title = makeTitle({id: 't', metadataVerified: true});
    expect(isMetadataUnverified(title)).toBe(false);
    expect(metadataNotice(title)).toBeUndefined();
  });
});

describe('synopsisText', () => {
  it('returns the trimmed synopsis', () => {
    expect(synopsisText(makeTitle({id: 't', synopsis: '  A story.  '}))).toBe('A story.');
  });

  it('falls back when the synopsis is missing or blank', () => {
    expect(synopsisText(makeTitle({id: 't'}))).toBe('No description available.');
    expect(synopsisText(makeTitle({id: 't', synopsis: '   '}))).toBe('No description available.');
  });
});

describe('whyThis', () => {
  it('returns the engine reason', () => {
    const recommendation = {
      title: makeTitle({id: 't'}),
      score: 1,
      strategy: 'balanced' as const,
      memberScores: [],
      reason: 'Safe for the youngest viewer',
    };
    expect(whyThis(recommendation)).toBe('Safe for the youngest viewer');
  });

  it('falls back when the reason is empty', () => {
    const recommendation = {
      title: makeTitle({id: 't'}),
      score: 1,
      strategy: 'balanced' as const,
      memberScores: [],
      reason: '   ',
    };
    expect(whyThis(recommendation)).toBe('Recommended by the group-balancing engine.');
  });
});

describe('memberScoreLabel', () => {
  it('names the viewer and formats the score', () => {
    const ada = makeProfile({id: 'ada', name: 'Ada'});
    expect(memberScoreLabel({profileId: 'ada', score: 0.5}, [ada])).toBe('Ada: 0.50');
  });

  it('falls back to the id when the profile is unknown', () => {
    expect(memberScoreLabel({profileId: 'ghost', score: 0.25}, [])).toBe('ghost: 0.25');
  });
});

describe('errorMessage', () => {
  it('uses the error message when available', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
  });

  it('falls back for unknown or empty errors', () => {
    expect(errorMessage('nope')).toBe('Something went wrong.');
    expect(errorMessage(new Error(''))).toBe('Something went wrong.');
  });
});
