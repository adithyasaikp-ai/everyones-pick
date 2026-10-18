import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {colors, fontSize, spacing} from '../theme';
import {FocusableButton} from './FocusableButton';

export type StateKind = 'loading' | 'empty' | 'error';

interface Props {
  readonly kind: StateKind;
  readonly title: string;
  readonly message?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly hasTVPreferredFocus?: boolean;
}

/** Shared loading / empty / error presentation for every screen. */
export function StateView({
  kind,
  title,
  message,
  actionLabel,
  onAction,
  hasTVPreferredFocus = false,
}: Props) {
  return (
    <View style={styles.root}>
      {kind === 'loading' ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Text style={[styles.mark, kind === 'error' ? styles.errorMark : styles.emptyMark]}>
          {kind === 'error' ? '!' : '◍'}
        </Text>
      )}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <FocusableButton
          label={actionLabel}
          onPress={onAction}
          hasTVPreferredFocus={hasTVPreferredFocus}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  mark: {
    fontSize: fontSize.xxl,
    marginBottom: spacing.md,
  },
  emptyMark: {
    color: colors.textMuted,
  },
  errorMark: {
    color: colors.danger,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 720,
    lineHeight: fontSize.md + 6,
  },
  action: {
    marginTop: spacing.lg,
  },
});
