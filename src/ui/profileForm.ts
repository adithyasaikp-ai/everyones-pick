import type {Genre} from '../domain/types';

/**
 * Pure helpers for the "add a family member" form. Kept separate from the
 * screen component so validation and id generation are unit-testable.
 */

export interface ProfileDraft {
  readonly name: string;
  readonly age: string;
  readonly favoriteGenres: readonly Genre[];
  readonly avoidGenres: readonly Genre[];
}

export function emptyDraft(): ProfileDraft {
  return {name: '', age: '', favoriteGenres: [], avoidGenres: []};
}

export function toggleGenre(list: readonly Genre[], genre: Genre): Genre[] {
  return list.includes(genre) ? list.filter(entry => entry !== genre) : [...list, genre];
}

export interface ValidDraft {
  readonly name: string;
  readonly age: number;
  readonly favoriteGenres: Genre[];
  readonly avoidGenres: Genre[];
}

export type DraftResult =
  | {readonly ok: true; readonly value: ValidDraft}
  | {readonly ok: false; readonly errors: readonly string[]};

export function validateDraft(draft: ProfileDraft): DraftResult {
  const errors: string[] = [];
  const name = draft.name.trim();
  const rawAge = draft.age.trim();

  if (name.length === 0) {
    errors.push('Please enter a name.');
  }

  const age = Number(rawAge);
  if (rawAge.length === 0) {
    errors.push('Please enter an age.');
  } else if (!Number.isInteger(age) || age < 0 || age > 120) {
    errors.push('Age must be a whole number between 0 and 120.');
  }

  if (errors.length > 0) {
    return {ok: false, errors};
  }

  return {
    ok: true,
    value: {
      name,
      age,
      favoriteGenres: [...draft.favoriteGenres],
      avoidGenres: [...draft.avoidGenres],
    },
  };
}

export function createProfileId(existingIds: readonly string[], name: string): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'viewer';

  if (!existingIds.includes(base)) {
    return base;
  }
  let suffix = 2;
  while (existingIds.includes(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}
