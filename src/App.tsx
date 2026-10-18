import {useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, StatusBar, StyleSheet, View} from 'react-native';

import {SAMPLE_CATALOG} from './data/catalog';
import {StateView} from './ui/components/StateView';
import {
  INITIAL_STACK,
  canPop,
  currentRoute,
  pop,
  push,
  type NavStack,
  type Route,
} from './ui/navigation';
import {GroupSelectScreen} from './ui/screens/GroupSelectScreen';
import {ProfileSetupScreen} from './ui/screens/ProfileSetupScreen';
import {RecommendationsScreen} from './ui/screens/RecommendationsScreen';
import {TitleDetailScreen} from './ui/screens/TitleDetailScreen';
import {resolveSelected, toggleMember} from './ui/selection';
import {colors} from './ui/theme';
import {useAppData} from './ui/useAppData';
import {useRecommendations} from './ui/useRecommendations';

export default function App() {
  const app = useAppData();
  const [stack, setStack] = useState<NavStack>(INITIAL_STACK);
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const initialisedSelection = useRef(false);

  const route = currentRoute(stack);

  useEffect(() => {
    if (app.status !== 'ready') {
      return;
    }
    setSelectedIds(previous => previous.filter(id => app.profiles.some(p => p.id === id)));
    if (!initialisedSelection.current && app.profiles.length > 0) {
      initialisedSelection.current = true;
      setSelectedIds(app.profiles.map(profile => profile.id));
    }
  }, [app.status, app.profiles]);

  const selectedProfiles = useMemo(
    () => resolveSelected(app.profiles, selectedIds),
    [app.profiles, selectedIds],
  );
  const {recommendations, error: recommendError} = useRecommendations(
    selectedProfiles,
    app.feedback,
  );

  const go = (next: Route) => setStack(current => push(current, next));
  const back = () => setStack(current => pop(current));

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canPop(stack)) {
        setStack(pop(stack));
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [stack]);

  if (app.status === 'loading') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <StateView kind="loading" title="Loading Everyone's Pick…" />
      </View>
    );
  }

  if (app.status === 'error') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" />
        <StateView
          kind="error"
          title="Could not load your family"
          message={app.error}
          actionLabel="Retry"
          onAction={app.reload}
          hasTVPreferredFocus
        />
      </View>
    );
  }

  const renderRoute = () => {
    switch (route.name) {
      case 'group':
        return (
          <GroupSelectScreen
            profiles={app.profiles}
            selectedIds={selectedIds}
            onToggle={id => setSelectedIds(current => toggleMember(current, id))}
            onContinue={() => go({name: 'recommendations'})}
            onManageFamily={() => go({name: 'profiles'})}
          />
        );
      case 'profiles':
        return (
          <ProfileSetupScreen
            profiles={app.profiles}
            onAdd={app.addProfile}
            onRemove={app.removeProfile}
            onBack={back}
          />
        );
      case 'recommendations':
        return (
          <RecommendationsScreen
            profiles={selectedProfiles}
            feedback={app.feedback}
            recommendations={recommendations}
            error={recommendError}
            onOpen={titleId => go({name: 'detail', titleId})}
            onReact={app.react}
            onBack={back}
            onManageGroup={() => go({name: 'group'})}
          />
        );
      case 'detail': {
        const title = SAMPLE_CATALOG.find(entry => entry.id === route.titleId);
        if (!title) {
          return (
            <StateView
              kind="error"
              title="Title unavailable"
              message="That title is no longer in the catalog."
              actionLabel="Back"
              onAction={back}
              hasTVPreferredFocus
            />
          );
        }
        const recommendation = recommendations.find(entry => entry.title.id === title.id);
        return (
          <TitleDetailScreen
            title={title}
            recommendation={recommendation}
            profiles={selectedProfiles}
            feedback={app.feedback}
            onReact={app.react}
            onBack={back}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      {renderRoute()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
