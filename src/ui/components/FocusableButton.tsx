import {useState} from 'react';
import {Pressable, StyleSheet, Text, type StyleProp, type ViewStyle} from 'react-native';

import {colors, fontSize, radius, spacing} from '../theme';

export type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'active';

interface Props {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
  readonly hasTVPreferredFocus?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {backgroundColor: colors.primary},
  ghost: {backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border},
  danger: {backgroundColor: colors.danger},
  active: {backgroundColor: colors.accent},
};

export function FocusableButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  hasTVPreferredFocus = false,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled}}
      disabled={disabled}
      focusable={!disabled}
      hasTVPreferredFocus={hasTVPreferredFocus}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.base,
        variantStyles[variant],
        focused && styles.focused,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'primary' && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focused: {
    borderColor: colors.borderFocused,
    transform: [{scale: 1.05}],
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  primaryLabel: {
    color: colors.primaryText,
  },
});
