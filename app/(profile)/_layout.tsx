import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ProfileLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="profileSettings"
        options={{
          headerShown: true,
          title: 'Profile',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditName"
        options={{
          headerShown: true,
          title: 'Name',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditBio"
        options={{
          headerShown: true,
          title: 'About Me',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditPhone"
        options={{
          headerShown: true,
          title: 'Phone Number',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        options={{
          headerShown: true,
          title: 'Forgotten Password',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
