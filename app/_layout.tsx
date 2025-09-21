import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import '../i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsExtraBold: require('../assets/fonts/Poppins-ExtraBold.ttf'),
    PoppinsExtraLight: require('../assets/fonts/Poppins-ExtraLight.ttf'),
    PoppinsLight: require('../assets/fonts/Poppins-Light.ttf'),
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'), // fixed typo
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
    <>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    </>
  );
}
