# everyones-pick

Fire TV app that picks what a whole family can watch tonight: age-safe, group-balanced recommendations that learn from feedback.

## Getting started

The app is React Native TV (`react-native-tvos`); the only native project in the
repository is `android/` (there is no `ios/` folder). Each command below is
labelled with the directory it must be run from.

### Prerequisites

Install on a fresh macOS machine:

1. **Node.js ≥ 18** — required by `package.json` (`engines.node`).
2. **JDK 17** — required by the React Native 0.76 / Android Gradle Plugin
   toolchain. For example: `brew install --cask temurin@17`.
3. **Android SDK command-line tools** — via Android Studio's SDK Manager, or
   `brew install --cask android-commandlinetools`. Make sure `sdkmanager` is on
   your `PATH`.

Add these exports to your shell profile (adjust `ANDROID_HOME` to your SDK root):

```sh
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

Install the SDK components pinned by `android/build.gradle` (compileSdk 35,
build-tools 35.0.0, NDK 26.1.10909125) and accept the licences:

```sh
sdkmanager "platform-tools" "emulator" "platforms;android-35" \
  "build-tools;35.0.0" "ndk;26.1.10909125" "cmake;3.22.1"
sdkmanager --licenses          # or: yes | sdkmanager --licenses
```

Then either keep `ANDROID_HOME` exported, or point the project at the SDK with a
git-ignored `android/local.properties` (run from the repository root):

```sh
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

### Install dependencies

From the repository root:

```sh
git clone https://github.com/adithyasaikp-ai/everyones-pick.git
cd everyones-pick
npm ci
```

A committed `package-lock.json` (lockfileVersion 3) matches `package.json`, so
`npm ci` installs the exact locked tree; use `npm install` only when you intend to
change dependencies.

Keep the repository's `.npmrc`. It sets `legacy-peer-deps=true` because
`react-native-tvos` is published as a **prerelease**
(`npm:react-native-tvos@0.76.9-0`) that does not satisfy the strict peer ranges
some community libraries declare. With this setting npm resolves those peer
dependencies leniently instead of aborting with an `ERESOLVE` error; removing it
can make `npm ci` / `npm install` fail.

### Start an Android TV emulator

Install a TV system image — `arm64-v8a` on Apple Silicon, `x86_64` on Intel hosts
— then create and boot an AVD. Run these from the repository root:

```sh
# Apple Silicon:
sdkmanager "system-images;android-34;android-tv;arm64-v8a"
# Intel:
sdkmanager "system-images;android-34;android-tv;x86_64"

avdmanager create avd -n EveryonesPickTV \
  -k "system-images;android-34;android-tv;arm64-v8a" -d tv_1080p
emulator -avd EveryonesPickTV &
adb wait-for-device
adb devices          # the emulator should be listed as `device`
```

### Start Metro and launch the app

The debug build loads its JavaScript from Metro, so Metro must be running. Run
both commands from the repository root, in separate terminals:

```sh
# Terminal 1 — Metro
npm start

# Terminal 2 — build, install and launch on the running emulator
npm run android
```

To install an already-built debug APK instead (still from the repository root):

```sh
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
adb shell am start -n com.everyonespick/.MainActivity
```

On first launch the household is empty, so add at least one family member (with
an age) before requesting recommendations.

### Verify the JavaScript

Run from the repository root:

```sh
npm run verify        # typecheck + lint + tests (tsc, eslint, vitest)
npm run test          # tests only (vitest run)
npm run test:watch    # tests in watch mode
npm run typecheck     # tsc --noEmit
npm run lint          # eslint .
npm run lint:fix      # eslint . --fix
npm run format        # prettier --write
npm run format:check  # prettier --check
```

### Build a debug APK

Run Gradle from inside `android/`:

```sh
cd android
./gradlew assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`. It is
signed with the default debug keystore (`~/.android/debug.keystore`, created on
demand); `android/app/build/` and `*.apk` are git-ignored.

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
- **Release signing not configured**: `android/app/build.gradle` defines no
  `signingConfig` for the `release` build type, so release builds are unsigned and
  cannot be submitted to the Amazon Appstore as-is; a keystore and a release
  signing config must be added first.
- **No schema migration**: the version field is recorded but old payloads are
  only read leniently, not migrated field-by-field.
- **Local only**: state is stored on-device via AsyncStorage; there is no sync,
  account or multi-device support.
- **No encryption**: stored profiles and feedback are plain JSON.
- **Feedback growth**: feedback is stored unbounded and never pruned.
