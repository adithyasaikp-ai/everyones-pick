import {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import type {Feedback, FeedbackKind, Profile, Recommendation, Title} from '../../domain/types';
import {Chip} from '../components/Chip';
import {FocusableButton} from '../components/FocusableButton';
import {RatingBadge} from '../components/RatingBadge';
import {Screen} from '../components/Screen';
import {
  ageSuitabilityLabel,
  formatRuntime,
  genreLabel,
  memberScoreLabel,
  metadataNotice,
  synopsisText,
  whyThis,
} from '../presenters';
import {reactionOf} from '../selection';
import {colors, fontSize, spacing} from '../theme';

interface Props {
  readonly title: Title;
  readonly recommendation?: Recommendation;
  readonly profiles: readonly Profile[];
  readonly feedback: readonly Feedback[];
  readonly onReact: (profileId: string, titleId: string, kind: FeedbackKind) => void;
  readonly onBack: () => void;
}

export function TitleDetailScreen({
  title,
  recommendation,
  profiles,
  feedback,
  onReact,
  onBack,
}: Props) {
  const [memberId, setMemberId] = useState<string | undefined>(profiles[0]?.id);
  const reaction = memberId ? reactionOf(feedback, memberId, title.id) : undefined;
  const notice = metadataNotice(title);

  return (
    <Screen
      title={title.name}
      subtitle={`${title.year} · ${formatRuntime(title.runtimeMinutes)}`}
      onBack={onBack}
    >
      <View style={styles.badges}>
        <RatingBadge title={title} />
        <Text style={styles.suitability}>{ageSuitabilityLabel(title)}</Text>
      </View>
      <Text style={styles.genres}>{genreLabel(title.genres)}</Text>
      <Text style={styles.synopsis}>{synopsisText(title)}</Text>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why this?</Text>
        <Text style={styles.why}>
          {recommendation
            ? whyThis(recommendation)
            : 'Details only — no group ranking was available for this title.'}
        </Text>
      </View>

      {recommendation && recommendation.memberScores.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group scores</Text>
          {recommendation.memberScores.map(score => (
            <Text key={score.profileId} style={styles.memberScore}>
              {memberScoreLabel(score, profiles)}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Record a reaction</Text>
        {profiles.length > 1 ? (
          <View style={styles.chips}>
            {profiles.map(profile => (
              <Chip
                key={profile.id}
                label={profile.name}
                selected={memberId === profile.id}
                onPress={() => setMemberId(profile.id)}
              />
            ))}
          </View>
        ) : null}
        <View style={styles.actions}>
          <FocusableButton
            label={reaction === 'like' ? '✓ Liked' : 'Like'}
            variant={reaction === 'like' ? 'active' : 'ghost'}
            disabled={!memberId}
            onPress={() => {
              if (memberId) {
                onReact(memberId, title.id, 'like');
              }
            }}
          />
          <FocusableButton
            label={reaction === 'dislike' ? '✕ Not for us' : 'Dislike'}
            variant={reaction === 'dislike' ? 'danger' : 'ghost'}
            disabled={!memberId}
            onPress={() => {
              if (memberId) {
                onReact(memberId, title.id, 'dislike');
              }
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  suitability: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  genres: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  synopsis: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: fontSize.md + 8,
    marginTop: spacing.md,
    maxWidth: 960,
  },
  notice: {
    color: colors.accent,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    maxWidth: 960,
  },
  section: {
    marginTop: spacing.xl,
    maxWidth: 960,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  why: {
    color: colors.text,
    fontSize: fontSize.md,
    lineHeight: fontSize.md + 8,
  },
  memberScore: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
