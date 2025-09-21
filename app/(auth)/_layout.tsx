import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="welcome"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="signIn"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="signUp"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="phoneVerification"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="userRole"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="languageSelection"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </Stack>
  );
}
