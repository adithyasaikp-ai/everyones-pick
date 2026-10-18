/**
 * Shared visual tokens for the TV interface.
 * Dark, high-contrast palette tuned for a 10-foot viewing distance.
 */
export const colors = {
  background: '#070B14',
  surface: '#111827',
  surfaceAlt: '#1B2436',
  surfaceFocused: '#243352',
  border: '#2A3550',
  borderFocused: '#7FB0FF',
  text: '#F4F7FF',
  textMuted: '#9BA6C4',
  primary: '#4F8CFF',
  primaryText: '#04101F',
  accent: '#FFB020',
  success: '#3DDC97',
  danger: '#FF6B6B',
  overlay: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 34,
  xxl: 46,
} as const;
