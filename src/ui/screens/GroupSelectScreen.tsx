import {StyleSheet, Text, View} from 'react-native';

import type {Profile} from '../../domain/types';
import {FocusableButton} from '../components/FocusableButton';
import {FocusableCard} from '../components/FocusableCard';
import {Screen} from '../components/Screen';
import {StateView} from '../components/StateView';
import {colors, fontSize, spacing} from '../theme';

interface Props {
  readonly profiles: readonly Profile[];
  readonly selectedIds: readonly string[];
  readonly onToggle: (id: string) => void;
  readonly onContinue: () => void;
  readonly onManageFamily: () => void;
}

export function GroupSelectScreen({
  profiles,
  selectedIds,
  onToggle,
  onContinue,
  onManageFamily,
}: Props) {
  if (profiles.length === 0) {
    return (
      <Screen title={"Who's watching?"} subtitle="Set up your household to get started.">
        <StateView
          kind="empty"
          title="No family members yet"
          message="Add the people in your household — including their ages — so recommendations stay age-safe."
          actionLabel="Add family members"
          onAction={onManageFamily}
          hasTVPreferredFocus
        />
      </Screen>
    );
  }

  const selectedCount = selectedIds.length;

  return (
    <Screen
      title={"Who's watching?"}
      subtitle="Select everyone watching together, then find a pick for the whole group."
    >
      <View style={styles.grid}>
        {profiles.map((profile, index) => {
          const selected = selectedIds.includes(profile.id);
          return (
            <FocusableCard
              key={profile.id}
              onPress={() => onToggle(profile.id)}
              hasTVPreferredFocus={index === 0}
              accessibilityLabel={`${profile.name}, age ${profile.age}`}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.age}>{`Age ${profile.age}`}</Text>
              <Text style={[styles.state, selected ? styles.stateOn : styles.stateOff]}>
                {selected ? '✓ Watching' : 'Press to include'}
              </Text>
            </FocusableCard>
          );
        })}
      </View>
      <View style={styles.footer}>
        <FocusableButton label="Manage family" variant="ghost" onPress={onManageFamily} />
        <FocusableButton
          label={
            selectedCount > 0
              ? `Find something to watch (${selectedCount})`
              : 'Select someone first'
          }
          onPress={onContinue}
          disabled={selectedCount === 0}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  card: {
    width: 300,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  age: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  state: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  stateOn: {
    color: colors.success,
  },
  stateOff: {
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
});
