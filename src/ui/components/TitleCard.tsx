import {StyleSheet, Text, View} from 'react-native';

import type {Title} from '../../domain/types';
import {formatRuntime, genreLabel} from '../presenters';
import {colors, fontSize, spacing} from '../theme';
import {RatingBadge} from './RatingBadge';

interface Props {
  readonly title: Title;
  readonly showSynopsis?: boolean;
}

export function TitleCard({title, showSynopsis = false}: Props) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {title.name}
        </Text>
        <RatingBadge title={title} />
      </View>
      <Text style={styles.meta} numberOfLines={1}>
        {`${title.year}  ·  ${formatRuntime(title.runtimeMinutes)}  ·  ${genreLabel(title.genres)}`}
      </Text>
      {showSynopsis ? (
        <Text style={styles.synopsis} numberOfLines={3}>
          {title.synopsis ?? 'No description available.'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  synopsis: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.md,
    lineHeight: fontSize.md + 6,
  },
});
