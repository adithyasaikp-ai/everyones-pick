import AsyncStorage from '@react-native-async-storage/async-storage';

import type {KeyValueStore} from './store';

/**
 * React Native adapter over `@react-native-async-storage/async-storage`.
 * This is the only file in the persistence layer that touches React Native.
 */
export const asyncStorageStore: KeyValueStore = {
  getItem: key => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: key => AsyncStorage.removeItem(key),
};
