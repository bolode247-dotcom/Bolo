import { getUnreadChatsCount } from '@/appwriteFuncs/appwriteGenFunc';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import { client } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'react-native';

export default function TabsLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [unreadChats, setUnreadChats] = React.useState(0);

  const isRecruiter = user?.role === 'recruiter';

  // Full list of possible tabs
  const allTabs = [
    { name: 'index', title: t('tabs.home'), icon: 'home' as const },
    { name: 'workers', title: t('tabs.workers'), icon: 'people' as const },
    { name: 'jobs', title: t('tabs.jobs'), icon: 'briefcase' as const },
    {
      name: 'applications',
      title: t('tabs.applications'),
      icon: 'document' as const,
    },
    { name: 'myJobs', title: t('tabs.myJobs'), icon: 'briefcase' as const },
    {
      name: 'chats',
      title: t('tabs.chats'),
      icon: 'chatbox-ellipses' as const,
    },
    { name: 'profile', title: t('tabs.profile'), icon: 'person' as const },
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

  useEffect(() => {
    if (!user?.$id) return;

    let isMounted = true;
    let unsubscribe = () => {};

    const loadUnread = async () => {
      try {
        const count = await getUnreadChatsCount(
          isRecruiter ? user.recruiters?.$id : user.workers?.$id,
          user.role,
        );
        if (isMounted) setUnreadChats(count);
      } catch (err) {
        console.error('❌ Error fetching unread chats count:', err);
      }
    };

    // Initial load
    loadUnread();

    // Realtime subscription
    try {
      unsubscribe = client.subscribe(
        `databases.${appwriteConfig.dbId}.collections.${appwriteConfig.chatsCol}.documents`,
        async (res) => {
          try {
            const shouldRefresh = res.events.some(
              (e) => e.includes('.update') || e.includes('.create'),
            );

            if (shouldRefresh) {
              const count = await getUnreadChatsCount(
                isRecruiter ? user.recruiters?.$id : user.workers?.$id,
                user.role,
              );
              if (isMounted) setUnreadChats(count);
            }
          } catch (innerErr) {
            console.error('⚠️ Error inside realtime callback:', innerErr);
          }
        },
      );
    } catch (err) {
      console.error('❌ Failed to initialize realtime subscription:', err);
    }

    // Cleanup
    return () => {
      isMounted = false;
      try {
        unsubscribe();
      } catch (cleanupErr) {
        console.error('⚠️ Error during realtime unsubscribe:', cleanupErr);
      }
    };
  }, [user?.$id]);

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
              tabBarBadge:
                tab.name === 'chats' && unreadChats > 0
                  ? unreadChats
                  : undefined,
            }}
          />
        ))}
      </Tabs>
    </>
  );
}
