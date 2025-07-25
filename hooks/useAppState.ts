import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      appState.current = nextAppState;
      setAppStateVisible(nextAppState);
    });

    return () => subscription?.remove();
  }, []);

  return {
    appState: appStateVisible,
    isActive: appStateVisible === 'active',
    isBackground: appStateVisible === 'background',
    isInactive: appStateVisible === 'inactive',
  };
}