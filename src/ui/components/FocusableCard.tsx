import {useState, type ReactNode} from 'react';
import {Pressable, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';

import {colors, radius, spacing} from '../theme';

interface Props {
  readonly onPress: () => void;
  readonly children: ReactNode;
  readonly hasTVPreferredFocus?: boolean;
  readonly accessibilityLabel?: string;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * Large, focus-highlighted surface for TV cards. Focus is tracked locally so the
 * highlight is explicit and does not rely on platform-specific style callbacks.
 */
export function FocusableCard({
  onPress,
  children,
  hasTVPreferredFocus = false,
  accessibilityLabel,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      focusable
      hasTVPreferredFocus={hasTVPreferredFocus}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={[styles.card, focused && styles.focused, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  focused: {
    backgroundColor: colors.surfaceFocused,
    borderColor: colors.borderFocused,
    transform: [{scale: 1.02}],
  },
});
