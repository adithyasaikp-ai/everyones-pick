import type {Profile, Title} from '../domain/types';

/**
 * DEMO CATALOG — UNVERIFIED METADATA.
 *
 * Every title below is fictional and was written for this project. Nothing in
 * this file is sourced from, or claims to represent, a real film, series,
 * broadcaster or catalogue:
 *
 * - no official/certified age ratings are asserted; `ageRating` is this app's
 *   own coarse suitability estimate used by the age-safety filter
 * - `year`, `runtimeMinutes` and `popularity` are plausible but invented
 *   numbers, not measured values
 * - there are no streaming URLs and no licensing/availability claims
 * - `metadataVerified: false` marks every entry as unverified
 *
 * Replace this module with a verified data source before shipping.
 */
export const CATALOG_DISCLAIMER =
  'Fictional demo titles with unverified metadata. Age ratings are local suitability estimates, not official certifications.';

export const SAMPLE_CATALOG: readonly Title[] = [
  {
    id: 'lantern-keepers',
    name: 'The Lantern Keepers',
    year: 2021,
    runtimeMinutes: 92,
    ageRating: 'G',
    genres: ['animation', 'family', 'adventure'],
    popularity: 0.72,
    synopsis: 'Two siblings mind a lighthouse whose beam keeps forgotten stories from fading away.',
    metadataVerified: false,
  },
  {
    id: 'nebula-drift',
    name: 'Nebula Drift',
    year: 2019,
    runtimeMinutes: 128,
    ageRating: 'PG-13',
    genres: ['sci-fi', 'action', 'adventure'],
    popularity: 0.81,
    synopsis: 'A salvage crew races a collapsing wormhole to bring a stranded colony home.',
    metadataVerified: false,
  },
  {
    id: 'midnight-bakery',
    name: 'Midnight Bakery',
    year: 2022,
    runtimeMinutes: 104,
    ageRating: 'PG',
    genres: ['comedy', 'romance'],
    popularity: 0.66,
    synopsis: 'Two rival bakers share a shop lease and an oven that only works after dark.',
    metadataVerified: false,
  },
  {
    id: 'roots-of-the-deep',
    name: 'Roots of the Deep',
    year: 2020,
    runtimeMinutes: 88,
    ageRating: 'G',
    genres: ['documentary'],
    popularity: 0.58,
    synopsis: 'A slow tour of kelp forests and the creatures that shelter among them.',
    metadataVerified: false,
  },
  {
    id: 'hollow-pines',
    name: 'Hollow Pines',
    year: 2018,
    runtimeMinutes: 106,
    ageRating: 'R',
    genres: ['horror', 'mystery'],
    popularity: 0.7,
    synopsis: 'A ranger follows strange lights into a forest that appears on no map.',
    metadataVerified: false,
  },
  {
    id: 'paper-dragons',
    name: 'Paper Dragons',
    year: 2023,
    runtimeMinutes: 99,
    ageRating: 'PG',
    genres: ['fantasy', 'family', 'adventure'],
    popularity: 0.63,
    synopsis: 'A shy child folds origami creatures that come to life at dusk.',
    metadataVerified: false,
  },
  {
    id: 'the-last-signal',
    name: 'The Last Signal',
    year: 2021,
    runtimeMinutes: 112,
    ageRating: 'TV-14',
    genres: ['thriller', 'sci-fi', 'mystery'],
    popularity: 0.77,
    synopsis: 'A night-shift radio operator intercepts a broadcast seemingly sent from tomorrow.',
    metadataVerified: false,
  },
  {
    id: 'sunday-syncopation',
    name: 'Sunday Syncopation',
    year: 2017,
    runtimeMinutes: 96,
    ageRating: 'PG',
    genres: ['musical', 'comedy'],
    popularity: 0.54,
    synopsis: 'A choir and a jazz band are forced to rehearse in the same room every Sunday.',
    metadataVerified: false,
  },
  {
    id: 'coral-court',
    name: 'Coral Court',
    year: 2019,
    runtimeMinutes: 101,
    ageRating: 'TV-PG',
    genres: ['drama', 'family'],
    popularity: 0.6,
    synopsis: 'Neighbours in a seaside block navigate a summer of small upheavals.',
    metadataVerified: false,
  },
  {
    id: 'iron-meridian',
    name: 'Iron Meridian',
    year: 2022,
    runtimeMinutes: 134,
    ageRating: 'PG-13',
    genres: ['action', 'adventure', 'sci-fi'],
    popularity: 0.85,
    synopsis: 'A courier crosses a divided continent to deliver a single locked case.',
    metadataVerified: false,
  },
  {
    id: 'whisperwood',
    name: 'Whisperwood',
    year: 2020,
    runtimeMinutes: 108,
    ageRating: 'TV-PG',
    genres: ['fantasy', 'adventure'],
    popularity: 0.64,
    synopsis: 'A cartographer maps a wood that quietly rearranges itself each night.',
    metadataVerified: false,
  },
  {
    id: 'great-doughnut-heist',
    name: 'The Great Doughnut Heist',
    year: 2023,
    runtimeMinutes: 85,
    ageRating: 'G',
    genres: ['comedy', 'family'],
    popularity: 0.69,
    synopsis: 'A neighbourhood kid plans an elaborate raid on a locked pastry case.',
    metadataVerified: false,
  },
  {
    id: 'static-hours',
    name: 'Static Hours',
    year: 2018,
    runtimeMinutes: 118,
    ageRating: 'TV-MA',
    genres: ['drama', 'thriller'],
    popularity: 0.59,
    synopsis: 'A sound engineer discovers a confession buried in an old tape.',
    metadataVerified: false,
  },
  {
    id: 'beyond-the-reef',
    name: 'Beyond the Reef',
    year: 2022,
    runtimeMinutes: 90,
    ageRating: 'G',
    genres: ['documentary', 'adventure'],
    popularity: 0.56,
    synopsis: 'Free divers document a reef slowly recovering after a decade of protection.',
    metadataVerified: false,
  },
  {
    id: 'ember-line',
    name: 'Ember Line',
    year: 2021,
    runtimeMinutes: 121,
    ageRating: 'TV-14',
    genres: ['thriller', 'drama'],
    popularity: 0.68,
    synopsis: 'A wildfire crew and a small town disagree about when to evacuate.',
    metadataVerified: false,
  },
];

/**
 * Demo viewing group used for previews and manual testing.
 * Fictional people; ages and preferences are illustrative only.
 */
export const SAMPLE_PROFILES: readonly Profile[] = [
  {
    id: 'ada',
    name: 'Ada',
    age: 8,
    favoriteGenres: ['animation', 'family', 'adventure'],
    avoidGenres: ['horror'],
  },
  {
    id: 'noah',
    name: 'Noah',
    age: 14,
    favoriteGenres: ['sci-fi', 'action', 'adventure'],
    avoidGenres: [],
  },
  {
    id: 'mira',
    name: 'Mira',
    age: 41,
    favoriteGenres: ['drama', 'documentary', 'mystery'],
    avoidGenres: ['horror'],
  },
];
