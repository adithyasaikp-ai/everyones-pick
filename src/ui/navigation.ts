/**
 * Minimal navigation model for the TV app.
 *
 * We deliberately avoid pulling in a navigation library: a TV flow is a small,
 * linear stack and the engine/persistence tests stay independent of it. This
 * module is pure so the back/forward behaviour is unit-testable.
 */

export type Route =
  | {readonly name: 'group'}
  | {readonly name: 'profiles'}
  | {readonly name: 'recommendations'}
  | {readonly name: 'detail'; readonly titleId: string};

export type RouteName = Route['name'];

export type NavStack = readonly Route[];

export const INITIAL_STACK: NavStack = [{name: 'group'}];

export function currentRoute(stack: NavStack): Route {
  return stack[stack.length - 1] ?? {name: 'group'};
}

export function push(stack: NavStack, route: Route): NavStack {
  return [...stack, route];
}

/** Pop the top route. The root route is never removed. */
export function pop(stack: NavStack): NavStack {
  return stack.length <= 1 ? stack : stack.slice(0, -1);
}

export function reset(route: Route): NavStack {
  return [route];
}

export function canPop(stack: NavStack): boolean {
  return stack.length > 1;
}
