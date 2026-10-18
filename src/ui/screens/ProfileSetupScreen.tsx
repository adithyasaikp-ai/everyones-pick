import {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

import {GENRES, type Profile} from '../../domain/types';
import {Chip} from '../components/Chip';
import {FocusableButton} from '../components/FocusableButton';
import {Screen} from '../components/Screen';
import {
  createProfileId,
  emptyDraft,
  toggleGenre,
  validateDraft,
  type ProfileDraft,
} from '../profileForm';
import {colors, fontSize, radius, spacing} from '../theme';

interface Props {
  readonly profiles: readonly Profile[];
  readonly onAdd: (profile: Profile) => void;
  readonly onRemove: (id: string) => void;
  readonly onBack: () => void;
}

export function ProfileSetupScreen({profiles, onAdd, onRemove, onBack}: Props) {
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [errors, setErrors] = useState<readonly string[]>([]);

  const update = (patch: Partial<ProfileDraft>) => setDraft(current => ({...current, ...patch}));

  const save = () => {
    const result = validateDraft(draft);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onAdd({
      id: createProfileId(
        profiles.map(profile => profile.id),
        result.value.name,
      ),
      name: result.value.name,
      age: result.value.age,
      favoriteGenres: result.value.favoriteGenres,
      avoidGenres: result.value.avoidGenres,
    });
    setDraft(emptyDraft());
    setErrors([]);
  };

  return (
    <Screen
      title="Family"
      subtitle="Add everyone who might watch, with their age and tastes."
      onBack={onBack}
    >
      {profiles.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household</Text>
          {profiles.map(profile => (
            <View key={profile.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.rowMeta}>
                  {`Age ${profile.age} · likes ${profile.favoriteGenres.join(', ') || 'anything'}`}
                </Text>
              </View>
              <FocusableButton
                label="Remove"
                variant="danger"
                onPress={() => onRemove(profile.id)}
              />
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add a person</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={draft.name}
          onChangeText={name => update({name})}
          placeholder="e.g. Sam"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          value={draft.age}
          onChangeText={age => update({age})}
          placeholder="e.g. 12"
          keyboardType="number-pad"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Favourite genres</Text>
        <View style={styles.chips}>
          {GENRES.map(genre => (
            <Chip
              key={`fav-${genre}`}
              label={genre}
              selected={draft.favoriteGenres.includes(genre)}
              onPress={() => update({favoriteGenres: toggleGenre(draft.favoriteGenres, genre)})}
            />
          ))}
        </View>

        <Text style={styles.label}>Avoid genres</Text>
        <View style={styles.chips}>
          {GENRES.map(genre => (
            <Chip
              key={`avoid-${genre}`}
              label={genre}
              selected={draft.avoidGenres.includes(genre)}
              onPress={() => update({avoidGenres: toggleGenre(draft.avoidGenres, genre)})}
            />
          ))}
        </View>

        {errors.length > 0 ? (
          <View style={styles.errors}>
            {errors.map(error => (
              <Text key={error} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        ) : null}

        <FocusableButton label="Save person" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowText: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    maxWidth: 520,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 960,
    marginTop: spacing.xs,
  },
  errors: {
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.sm,
  },
});
