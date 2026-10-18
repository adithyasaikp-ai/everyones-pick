/**
 * Public entry point for the Everyone's Pick recommendation engine.
 *
 * Everything exported from here is framework-agnostic TypeScript. The UI layer
 * (React Native) depends on the engine, never the other way around.
 */
export * from '../domain/ageRating';
export * from '../domain/types';
export * from './ageSafety';
export * from './group';
export * from './recommend';
export * from './scoring';
export * from './taste';
