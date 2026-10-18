import {StyleSheet, Text, View} from 'react-native';

import type {Feedback, FeedbackKind, Profile, Recommendation} from '../../domain/types';
import {FocusableButton} from '../components/FocusableButton';
import {FocusableCard} from '../components/FocusableCard';
import {Screen} from '../components/Screen';
import {StateView} from '../components/StateView';
import {TitleCard} from '../components/TitleCard';
import {whyThis} from '../presenters';
import {reactionOf} from '../selection';
import {colors, fontSize, spacing} from '../theme';

interface Props {
  readonly profiles: readonly Profile[];
  readonly feedback: readonly Feedback[];
  readonly recommendations: readonly Recommendation[];
  readonly error?: string;
  readonly onOpen: (titleId: string) => void;
  readonly onReact: (profileId: string, titleId: string, kind: FeedbackKind) => void;
  readonly onBack: () => void;
  readonly onManageGroup: () => void;
}

export function RecommendationsScreen({
  profiles,
  feedback,
  recommendations,
  error,
  onOpen,
  onReact,
  onBack,
  onManageGroup,
}: Props) {
  const activeProfile = profiles[0];

  if (profiles.length === 0) {
    return (
      <Screen title="Tonight's pick" onBack={onBack}>
        <StateView
          kind="empty"
          title="No one selected"
          message="Choose who is watching so we can balance the group."
          actionLabel="Choose viewers"
          onAction={onManageGroup}
          hasTVPreferredFocus
        />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title="Tonight's pick" onBack={onBack}>
        <StateView kind="error" title="Could not build recommendations" message={error} />
      </Screen>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Screen title="Tonight's pick" onBack={onBack}>
        <StateView
          kind="empty"
          title="Nothing suitable found"
          message="No age-safe titles match this group right now. Try changing who is watching."
          actionLabel="Change viewers"
          onAction={onManageGroup}
          hasTVPreferredFocus
        />
      </Screen>
    );
  }

  return (
    <Screen
      title="Tonight's pick"
      subtitle={
        activeProfile
          ? `Reacting as ${activeProfile.name}. Select a title for full details.`
          : undefined
      }
      onBack={onBack}
    >
      {recommendations.map((recommendation, index) => {
        const reaction = activeProfile
          ? reactionOf(feedback, activeProfile.id, recommendation.title.id)
          : undefined;
        return (
          <View key={recommendation.title.id} style={styles.item}>
            <FocusableCard
              style={styles.card}
              hasTVPreferredFocus={index === 0}
              onPress={() => onOpen(recommendation.title.id)}
              accessibilityLabel={`${recommendation.title.name}, view details`}
            >
              <TitleCard title={recommendation.title} showSynopsis />
              <Text style={styles.why} numberOfLines={2}>
                {`Why this? ${whyThis(recommendation)}`}
              </Text>
            </FocusableCard>
            <View style={styles.actions}>
              <FocusableButton
                label={reaction === 'like' ? '✓ Liked' : 'Like'}
                variant={reaction === 'like' ? 'active' : 'ghost'}
                disabled={!activeProfile}
                onPress={() => {
                  if (activeProfile) {
                    onReact(activeProfile.id, recommendation.title.id, 'like');
                  }
                }}
              />
              <FocusableButton
                label={reaction === 'dislike' ? '✕ Not for us' : 'Dislike'}
                variant={reaction === 'dislike' ? 'danger' : 'ghost'}
                disabled={!activeProfile}
                onPress={() => {
                  if (activeProfile) {
                    onReact(activeProfile.id, recommendation.title.id, 'dislike');
                  }
                }}
              />
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  card: {
    flex: 1,
  },
  why: {
    color: colors.accent,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
  actions: {
    width: 220,
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
