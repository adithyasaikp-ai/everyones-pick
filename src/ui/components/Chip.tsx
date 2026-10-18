import {useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import {colors, fontSize, radius, spacing} from '../theme';

interface Props {
  readonly label: string;
  readonly selected: boolean;
  readonly onPress: () => void;
}

export function Chip({label, selected, onPress}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{selected}}
      accessibilityLabel={label}
      focusable
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected, focused && styles.focused]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {selected ? `✓ ${label}` : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  focused: {
    borderColor: colors.borderFocused,
    transform: [{scale: 1.05}],
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  selectedLabel: {
    color: colors.primaryText,
  },
});
