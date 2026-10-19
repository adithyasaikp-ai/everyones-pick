# everyones-pick

Fire TV app that picks what a whole family can watch tonight: age-safe, group-balanced recommendations that learn from feedback.

## Recommendation engine

The engine lives in `src/engine/` and is pure TypeScript — it has no React Native
dependency and is tested in a plain Node process.

Pipeline: validate → de-duplicate titles by id → **hard age filter** (drop any
title the youngest viewer cannot watch) → drop excluded titles → score each title
per viewer → aggregate per the group strategy → stable sort → take `limit`.

### Scoring formula (per viewer)

```
total = base + affinity + avoidance + learned

base      = clamp(popularity, 0, 1)
affinity  = 0.15 * (favourite genres present)
avoidance = -0.35 * (avoided genres present)
learned   = 0.4 * Σ boundedWeight(genre)
```

Learned weights come from feedback: each `like` adds +1 and each `dislike` adds
-1 to every genre on the reacted title, then the raw total is squashed with
`tanh(raw / 2)`, so a viewer's learned weight always stays strictly inside
(-1, 1). This bounds any single viewer's history.

### Group aggregation

- `balanced` (default): `min(viewers) + 0.25 * mean(viewers)` — rewards titles the
  least-happy viewer still enjoys, so one person's strong dislike sinks a pick.
- `least-misery`: maximises the worst individual score.
- `average`: maximises the mean score.
- `borda`: rank-based fairness across viewers.

Ties are broken by catalog order, so ranking is deterministic.

### Limitations

- Popularity and genre weights are hand-tuned constants, not learned from data.
- Feedback is modelled per genre only; it cannot capture title-level taste,
  mood, runtime or recency.
- The age map is a coarse rating-to-age table and ignores content descriptors.
- Scoring is stateless per request; there is no collaborative filtering or
  long-term personalisation.

## Data model

All types live in `src/domain/types.ts` and are framework-free.

| Type             | Purpose                                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `Title`          | Catalog item: id, name, year, runtime, `ageRating`, genres, popularity, synopsis, `metadataVerified` |
| `Profile`        | A viewer: id, name, age, `favoriteGenres`, `avoidGenres`                                             |
| `Feedback`       | One reaction: `profileId`, `titleId`, `kind` (`like`/`dislike`), `at`                                |
| `Recommendation` | Ranked result with `score`, `memberScores` and a `reason` string                                     |
| `GroupStrategy`  | `balanced` \| `borda` \| `least-misery` \| `average`                                                 |

Preferences (favourite/avoided genres) are stored **inside** each `Profile`.

### Sample catalog

`src/data/catalog.ts` ships 15 fictional titles and 3 demo profiles. Every title
is marked `metadataVerified: false`. These are **not** official age ratings and
there are **no** real titles, streaming URLs, licensing status or content-source
claims — see `CATALOG_DISCLAIMER`. Replace with a verified source before shipping.

## Persistence strategy

Local persistence lives in `src/state/` and is split so the engine and storage
logic stay React Native-free and unit-testable:

- `store.ts` — `KeyValueStore` interface plus an in-memory implementation.
- `persistence.ts` — pure load/save/clear logic and validation (no RN imports).
- `asyncStorageStore.ts` — the only file that imports AsyncStorage; implements
  `KeyValueStore` for the app.

Data is written as a versioned envelope `{version: 1, data: [...]}` under the
keys `@everyones-pick/profiles:v1` and `@everyones-pick/feedback:v1`. On read,
payloads are treated as untrusted:

- missing/empty storage → empty list
- malformed JSON or an unrecognized shape → empty list, error reported via
  `onError`
- individual invalid entries (bad id, negative age, unknown genre, bad kind) are
  dropped; valid entries are kept
- unknown genres and duplicate profile ids are removed; a missing name falls back
  to the id; a missing timestamp defaults to `0`
- a bare array payload is still accepted for forward/backward compatibility

Reads never throw (they return the valid subset and report through `onError`);
writes propagate storage failures so the UI can react.

## TV interface

The UI is layered so as much of it as possible is React Native-free and unit
tested:

- `src/ui/theme.ts` — colour, spacing, radius and font tokens (dark, high-contrast).
- `src/ui/navigation.ts` — a tiny pure stack (`push`/`pop`/`currentRoute`);
  there is no navigation dependency.
- `src/ui/selection.ts` — group selection and feedback reactions.
- `src/ui/presenters.ts` — domain-to-label formatting (runtime, ratings, reasons).
- `src/ui/profileForm.ts` — validation and id generation for the add-person form.
- `src/ui/components/` — `FocusableButton`, `FocusableCard`, `FocusableTextInput`,
  `Chip`, `RatingBadge`, `TitleCard`, `Screen`, `StateView`.
- `src/ui/screens/` — `GroupSelectScreen`, `ProfileSetupScreen`,
  `RecommendationsScreen`, `TitleDetailScreen`.
- `src/ui/useAppData.ts` / `src/ui/useRecommendations.ts` — load state through
  `src/state` and run the engine; screens never touch storage or the engine directly.

The screens are wired in `src/App.tsx`. Flow: choose who is watching → pick for the
group → open a title for details and record a like/dislike. TV focus is tracked with
`onFocus`/`onBlur` plus `focusable` / `hasTVPreferredFocus`; the hardware Back button
pops the navigation stack (and is left to the platform at the root).

A bare `TextInput` cannot receive D-pad focus on Android TV in react-native-tvos, so
`FocusableTextInput` wraps it in a focusable `Pressable` and focuses the inner input
when the wrapper is focused or pressed. This makes the add-person Name and Age fields
reachable and editable with the remote alone.

### Device verification

The app has been built and run on an Android 14 TV emulator (`EveryonesPickTV`, 1080p,
ARM64) using D-pad input. Verified flows: launch; D-pad navigation across buttons,
chips and cards; Android Back popping each screen; creating a profile and persisting
it; age-safe recommendations rendering; opening a title's details; and Like feedback
updating the recommendation reasoning. With `FocusableTextInput`, the Name and Age
fields are reachable and usable by D-pad alone, including opening the keyboard and
entering text.

Not yet verified: real Amazon Fire TV hardware, and the full multi-viewer and
group-balancing scenarios (`balanced` / `borda` / `least-misery` / `average`) end to end.

### Running and verifying

```sh
npm run verify   # typecheck + lint + tests
npm run format:check
```

## Known limitations

- **Unverified data**: the sample catalog's ratings, years, runtimes and
  popularity are invented and marked `metadataVerified: false`.
- **Partially device-verified**: the TV behaviour above was exercised on an
  Android 14 TV emulator only. It has not been tested on real Amazon Fire TV
  hardware, and the full multi-viewer and group-balancing scenarios have not been
  verified end to end.
- **Native project**: the Android project is included in the repository under
  `android/` (generated from `@react-native-tvos/template-tv`) and builds a debug
  APK. Building it requires a local Android SDK setup: JDK 17 plus the Android SDK
  (platform 35, build-tools 35.0.0, NDK 26.1.10909125), with `ANDROID_HOME` set or
  a local `android/local.properties`. The `ios/` folder is intentionally omitted.
- **No schema migration**: the version field is recorded but old payloads are
  only read leniently, not migrated field-by-field.
- **Local only**: state is stored on-device via AsyncStorage; there is no sync,
  account or multi-device support.
- **No encryption**: stored profiles and feedback are plain JSON.
- **Feedback growth**: feedback is stored unbounded and never pruned.
