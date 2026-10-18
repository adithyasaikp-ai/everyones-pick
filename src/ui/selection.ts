import type {Feedback, FeedbackKind} from '../domain/types';

/**
 * Pure interaction logic shared by the screens: group member selection and
 * feedback reactions. Kept free of React Native so it can be unit-tested.
 */

/** Add or remove a member id from the "watching together" selection. */
export function toggleMember(selected: readonly string[], profileId: string): string[] {
  return selected.includes(profileId)
    ? selected.filter(id => id !== profileId)
    : [...selected, profileId];
}

/** Resolve selected ids to profiles, preserving the original catalog order. */
export function resolveSelected<T extends {readonly id: string}>(
  all: readonly T[],
  selected: readonly string[],
): T[] {
  const wanted = new Set(selected);
  return all.filter(item => wanted.has(item.id));
}

export interface ReactionInput {
  readonly profileId: string;
  readonly titleId: string;
  readonly kind: FeedbackKind;
  readonly at: number;
}

/** Set (or replace) one profile's reaction to a title. */
export function setReaction(feedback: readonly Feedback[], input: ReactionInput): Feedback[] {
  const withoutExisting = feedback.filter(
    entry => !(entry.profileId === input.profileId && entry.titleId === input.titleId),
  );
  return [
    ...withoutExisting,
    {profileId: input.profileId, titleId: input.titleId, kind: input.kind, at: input.at},
  ];
}

/** Remove a profile's reaction to a title. */
export function clearReaction(
  feedback: readonly Feedback[],
  profileId: string,
  titleId: string,
): Feedback[] {
  return feedback.filter(entry => !(entry.profileId === profileId && entry.titleId === titleId));
}

/** Look up a profile's current reaction to a title, if any. */
export function reactionOf(
  feedback: readonly Feedback[],
  profileId: string,
  titleId: string,
): FeedbackKind | undefined {
  return feedback.find(entry => entry.profileId === profileId && entry.titleId === titleId)?.kind;
}

/** Re-selecting the same reaction clears it; otherwise it is set/replaced. */
export function toggleReaction(feedback: readonly Feedback[], input: ReactionInput): Feedback[] {
  return reactionOf(feedback, input.profileId, input.titleId) === input.kind
    ? clearReaction(feedback, input.profileId, input.titleId)
    : setReaction(feedback, input);
}
