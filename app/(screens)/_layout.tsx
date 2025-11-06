import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity } from 'react-native';

export default function ScreensLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: true,
          title: 'Notifications',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="recombWorkers"
        options={{
          headerShown: true,
          title: t('home.recommendedForYou'),
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="workerByCat"
        options={{
          headerShown: true,
          title: t('home.workerByCat'),
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          headerShown: true,
          title: t('home.categories'),
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          title: t('buttons.postJob'),
          headerTitleStyle: { fontFamily: 'PoppinsSemiBold' },
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: Colors.gray200, // background circle
                width: 32,
                height: 32,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Sizes.x3sm,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.gray800} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="jobComfirm"
        options={{
          headerShown: true,
          title: 'Comfirm Job',
          headerTitleStyle: { fontFamily: 'PoppinsSemiBold' },
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: Colors.gray200, // background circle
                width: 32,
                height: 32,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Sizes.x3sm,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.gray800} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="workerProfile"
        options={{
          headerShown: true,
          title: 'Profile',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="myJobDetails"
        options={{
          title: 'Details',
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="applicants"
        options={{
          title: 'Applicants',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          title: 'Messages',
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="jobDetails"
        options={{
          title: 'Details',
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="WorkerPosts"
        options={{
          title: 'Posts',
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
