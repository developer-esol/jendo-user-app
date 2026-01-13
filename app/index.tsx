import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/providers/AuthProvider';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(seen === 'true');
    };
    checkOnboarding();
  }, []);

  // Wait for both auth and onboarding checks
  if (isLoading || hasSeenOnboarding === null) {
    return null;
  }

  // If user is authenticated, go to app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If user has seen onboarding, go to login
  if (hasSeenOnboarding) {
    return <Redirect href="/auth/login" />;
  }

  // First time user - show onboarding
  return <Redirect href="/onboarding" />;
}
