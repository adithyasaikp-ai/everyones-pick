import type {ReactNode} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';

import {colors, fontSize, spacing} from '../theme';
import {FocusableButton} from './FocusableButton';

interface Props {
  readonly title: string;
  readonly subtitle?: string;
  readonly onBack?: () => void;
  readonly hasTVPreferredFocus?: boolean;
  readonly children: ReactNode;
}

/** Common screen chrome: safe area, header with optional Back, scrollable body. */
export function Screen({title, subtitle, onBack, hasTVPreferredFocus = false, children}: Props) {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        {onBack ? (
          <FocusableButton
            label="← Back"
            variant="ghost"
            onPress={onBack}
            hasTVPreferredFocus={hasTVPreferredFocus}
          />
        ) : null}
        <View style={styles.titles}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  titles: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
});
