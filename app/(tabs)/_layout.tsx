import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';

export default function TabsLayout() {
  const { user } = useAuth();
  const isRecruiter = user?.role === 'recruiter';

  // Full list of possible tabs
  const allTabs = [
    { name: 'index', title: 'Home', icon: 'home' as const },
    { name: 'workers', title: 'Workers', icon: 'people' as const },
    { name: 'jobs', title: 'Jobs', icon: 'briefcase' as const },
    { name: 'applications', title: 'Applications', icon: 'document' as const },
    { name: 'myJobs', title: 'My Jobs', icon: 'briefcase' as const },
    { name: 'chats', title: 'Chats', icon: 'chatbox-ellipses' as const },
    { name: 'profile', title: 'Profile', icon: 'person' as const },
  ];

  // Helper: determine if a tab should be visible for this user
  const isVisible = (tabName: string) => {
    if (isRecruiter) {
      return ['index', 'workers', 'myJobs', 'chats', 'profile'].includes(
        tabName,
      );
    }
    return ['index', 'jobs', 'applications', 'chats', 'profile'].includes(
      tabName,
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.primaryDark,
        }}
      >
        {allTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              href: isVisible(tab.name) ? undefined : null, // 👈 Hide tab if not allowed
              tabBarIcon: ({ focused, color, size }) => {
                // Choose filled icon when active, outline when inactive
                const iconName = focused
                  ? tab.icon // e.g., "home"
                  : `${tab.icon}-outline`; // e.g., "home-outline"
                return (
                  <Ionicons name={iconName as any} size={size} color={color} />
                );
              },
            }}
          />
        ))}
      </Tabs>
    </>
  );
}
