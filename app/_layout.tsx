import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { AuthProvider, useAuth } from '@/context/authContex';
import '../i18n';
import LoadingScreen from './LoadingScreen';

// Prevent splash screen auto-hide until fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsExtraBold: require('../assets/fonts/Poppins-ExtraBold.ttf'),
    PoppinsExtraLight: require('../assets/fonts/Poppins-ExtraLight.ttf'),
    PoppinsLight: require('../assets/fonts/Poppins-Light.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AppRouter />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    </AuthProvider>
  );
}

const AppRouter = () => {
  const { session, isLoading, hasCompletedOnboarding } = useAuth();

  console.log('Session:', session);
  console.log('Loading:', isLoading);
  console.log('Onboarding Completed:', hasCompletedOnboarding);
  if (isLoading) return <LoadingScreen />;

  return (
    <Stack>
      <Stack.Protected guard={!hasCompletedOnboarding}>
        <Stack.Screen name="Welcome" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={session && hasCompletedOnboarding}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
};
