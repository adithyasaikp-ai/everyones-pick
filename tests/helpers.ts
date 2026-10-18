import type {Profile, Title} from '../src/domain/types';

export function makeTitle(input: {id: string} & Partial<Title>): Title {
  const {id, ...rest} = input;
  return {
    id,
    name: id,
    year: 2020,
    runtimeMinutes: 100,
    ageRating: 'G',
    genres: [],
    popularity: 0.5,
    ...rest,
  };
}

export function makeProfile(input: {id: string} & Partial<Profile>): Profile {
  const {id, ...rest} = input;
  return {
    id,
    name: id,
    age: 10,
    favoriteGenres: [],
    avoidGenres: [],
    ...rest,
  };
}
