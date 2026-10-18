import {StyleSheet, Text, View} from 'react-native';

import type {Title} from '../../domain/types';
import {isMetadataUnverified} from '../presenters';
import {colors, fontSize, radius, spacing} from '../theme';

interface Props {
  readonly title: Title;
}

/** Age-rating pill. Flags metadata that has not been verified against a source. */
export function RatingBadge({title}: Props) {
  const unverified = isMetadataUnverified(title);

  return (
    <View style={[styles.badge, unverified ? styles.unverified : styles.verified]}>
      <Text style={styles.rating}>{title.ageRating}</Text>
      {unverified ? <Text style={styles.note}>unverified</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  verified: {
    borderColor: colors.success,
  },
  unverified: {
    borderColor: colors.accent,
  },
  rating: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  note: {
    color: colors.accent,
    fontSize: fontSize.xs,
    marginLeft: spacing.xs + 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
