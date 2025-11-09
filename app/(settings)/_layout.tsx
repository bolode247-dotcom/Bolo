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
      <Stack.Screen
        name="EditSkill"
        options={{
          headerShown: true,
          title: 'Edit Skill',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditLocation"
        options={{
          headerShown: true,
          title: 'Edit Location',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Credits"
        options={{
          headerShown: true,
          title: 'Credits',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Verify"
        options={{
          headerShown: true,
          title: 'Verify',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditWorkSample"
        options={{
          headerShown: true,
          title: 'Edit Post',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="AddWorkSample"
        options={{
          headerShown: true,
          title: 'Post',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="WorkSamples"
        options={{
          headerShown: true,
          title: 'Work Samples',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
