import {describe, expect, it} from 'vitest';

import {INITIAL_STACK, canPop, currentRoute, pop, push, reset} from '../../src/ui/navigation';

describe('navigation stack', () => {
  it('starts on the group screen', () => {
    expect(INITIAL_STACK).toEqual([{name: 'group'}]);
    expect(currentRoute(INITIAL_STACK)).toEqual({name: 'group'});
  });

  it('pushes routes onto the top of the stack', () => {
    const stack = push(INITIAL_STACK, {name: 'recommendations'});
    expect(currentRoute(stack)).toEqual({name: 'recommendations'});
    expect(stack).toHaveLength(2);
  });

  it('does not mutate the original stack when pushing', () => {
    const stack = push(INITIAL_STACK, {name: 'profiles'});
    expect(INITIAL_STACK).toHaveLength(1);
    expect(stack).not.toBe(INITIAL_STACK);
  });

  it('pops the top route', () => {
    const stack = push(push(INITIAL_STACK, {name: 'recommendations'}), {
      name: 'detail',
      titleId: 'lantern-keepers',
    });
    expect(pop(stack)).toEqual([{name: 'group'}, {name: 'recommendations'}]);
  });

  it('never pops the root route', () => {
    expect(pop(INITIAL_STACK)).toBe(INITIAL_STACK);
    expect(canPop(INITIAL_STACK)).toBe(false);
  });

  it('reports when there is somewhere to go back to', () => {
    expect(canPop(push(INITIAL_STACK, {name: 'profiles'}))).toBe(true);
  });

  it('resets to a single route', () => {
    expect(reset({name: 'group'})).toEqual([{name: 'group'}]);
  });

  it('falls back to the group screen for an empty stack', () => {
    expect(currentRoute([])).toEqual({name: 'group'});
  });
});
