import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POLICY_STORAGE_KEY = 'securopop_policy_v1';

export const POLICY_OPTIONS = [
  {
    key: 'screenCaptureBlock',
    label: 'Screen Capture Block (FLAG_SECURE)',
    description: 'Block screenshots, recent-app previews, and screen recording.'
  },
  {
    key: 'biometricLaunchLock',
    label: 'Biometric / Device PIN Launch Lock',
    description: 'Require biometric or device lock screen unlock on launch.'
  },
  {
    key: 'rootEmulatorDetection',
    label: 'Root & Emulator Detection',
    description: 'Detect rooted OS environments and unverified emulators.'
  },
  {
    key: 'clipboardLeakProtection',
    label: 'Clipboard Leak Protection',
    description: 'Prevent corporate note data from leaking via OS clipboard.'
  }
];

const DEFAULT_POLICY = {
  screenCaptureBlock: true,
  biometricLaunchLock: true,
  rootEmulatorDetection: true,
  clipboardLeakProtection: false
};

const PolicyContext = createContext(null);

export function PolicyProvider({ children }) {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStoredPolicy() {
      try {
        const raw = await AsyncStorage.getItem(POLICY_STORAGE_KEY);
        if (active && raw) {
          const parsed = JSON.parse(raw);
          setPolicy({ ...DEFAULT_POLICY, ...parsed });
        }
      } catch (_err) {
        // Fall back to default policy if storage is unreadable
      } finally {
        if (active) {
          setIsLoaded(true);
        }
      }
    }

    loadStoredPolicy();
    return () => {
      active = false;
    };
  }, []);

  async function togglePolicy(key) {
    const nextPolicy = {
      ...policy,
      [key]: !policy[key]
    };
    setPolicy(nextPolicy);

    try {
      await AsyncStorage.setItem(POLICY_STORAGE_KEY, JSON.stringify(nextPolicy));
    } catch (_err) {
      // Keep in-memory state responsive even if persistence fails
    }
  }

  const enabledCount = POLICY_OPTIONS.filter((opt) => Boolean(policy[opt.key])).length;

  return (
    <PolicyContext.Provider
      value={{
        policy,
        isLoaded,
        togglePolicy,
        enabledCount,
        totalCount: POLICY_OPTIONS.length
      }}
    >
      {children}
    </PolicyContext.Provider>
  );
}

export function usePolicy() {
  const ctx = useContext(PolicyContext);
  if (!ctx) {
    throw new Error('usePolicy must be used inside a PolicyProvider');
  }
  return ctx;
}
