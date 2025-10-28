import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="ChangeLanguage"
        options={{
          headerShown: true,
          title: 'Change Language',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        options={{
          headerShown: true,
          title: 'Privacy Policy',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Support"
        options={{
          headerShown: true,
          title: 'Help & Support',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
