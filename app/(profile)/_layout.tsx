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
        name="ChangePassword"
        options={{
          headerShown: true,
          title: 'Change Password',
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
      <Stack.Screen
        name="WorkSamples"
        options={{
          headerShown: true,
          title: 'Work Samples',
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
        name="EditWorkSample"
        options={{
          headerShown: true,
          title: 'Edit Post',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
    </Stack>
  );
}
