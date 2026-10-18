import {useCallback, useEffect, useState} from 'react';

import type {Feedback, FeedbackKind, Profile} from '../domain/types';
import {asyncStorageStore} from '../state/asyncStorageStore';
import {loadAppState, saveFeedback, saveProfiles} from '../state/persistence';
import type {KeyValueStore} from '../state/store';
import {errorMessage} from './presenters';
import {setReaction} from './selection';

/**
 * Loads profiles + feedback from the persistence layer and exposes the app's
 * data mutations. All storage work goes through `src/state`; the screens never
 * touch storage directly.
 */

export type AppDataStatus = 'loading' | 'ready' | 'error';

export interface AppData {
  readonly status: AppDataStatus;
  readonly error?: string;
  readonly profiles: readonly Profile[];
  readonly feedback: readonly Feedback[];
  readonly reload: () => void;
  readonly addProfile: (profile: Profile) => void;
  readonly removeProfile: (id: string) => void;
  readonly react: (profileId: string, titleId: string, kind: FeedbackKind) => void;
}

export function useAppData(store: KeyValueStore = asyncStorageStore): AppData {
  const [status, setStatus] = useState<AppDataStatus>('loading');
  const [error, setError] = useState<string | undefined>(undefined);
  const [profiles, setProfiles] = useState<readonly Profile[]>([]);
  const [feedback, setFeedback] = useState<readonly Feedback[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    let hadError = false;
    setStatus('loading');
    setError(undefined);

    loadAppState(store, {
      onError: cause => {
        hadError = true;
        if (active) {
          setError(errorMessage(cause));
        }
      },
    })
      .then(state => {
        if (!active) {
          return;
        }
        setProfiles(state.profiles);
        setFeedback(state.feedback);
        setStatus(hadError ? 'error' : 'ready');
      })
      .catch(cause => {
        if (!active) {
          return;
        }
        setError(errorMessage(cause));
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [store, reloadToken]);

  const addProfile = useCallback(
    (profile: Profile) => {
      const next = [...profiles.filter(entry => entry.id !== profile.id), profile];
      setProfiles(next);
      saveProfiles(store, next).catch(cause => setError(errorMessage(cause)));
    },
    [profiles, store],
  );

  const removeProfile = useCallback(
    (id: string) => {
      const nextProfiles = profiles.filter(entry => entry.id !== id);
      const nextFeedback = feedback.filter(entry => entry.profileId !== id);
      setProfiles(nextProfiles);
      setFeedback(nextFeedback);
      saveProfiles(store, nextProfiles).catch(cause => setError(errorMessage(cause)));
      saveFeedback(store, nextFeedback).catch(cause => setError(errorMessage(cause)));
    },
    [profiles, feedback, store],
  );

  const react = useCallback(
    (profileId: string, titleId: string, kind: FeedbackKind) => {
      const next = setReaction(feedback, {profileId, titleId, kind, at: Date.now()});
      setFeedback(next);
      saveFeedback(store, next).catch(cause => setError(errorMessage(cause)));
    },
    [feedback, store],
  );

  const reload = useCallback(() => setReloadToken(token => token + 1), []);

  return {status, error, profiles, feedback, reload, addProfile, removeProfile, react};
}
