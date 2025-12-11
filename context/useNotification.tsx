import { getUnreadNotificationsCount } from '@/appwriteFuncs/appwriteGenFunc';
import { client } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useAuth } from './authContex';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotificationCount = async () => {
    if (!user?.$id) return;

    try {
      const count = await getUnreadNotificationsCount(user);
      setNotificationCount(count);
    } catch (err) {
      console.log('Error fetching notification count:', err);
    }
  };

  useEffect(() => {
    if (!user?.$id) return;

    fetchNotificationCount();

    let unsubscribe: any = null;

    try {
      unsubscribe = client.subscribe(
        `databases.${appwriteConfig.dbId}.collections.${appwriteConfig.boloNotificationsCol}.documents`,
        (response) => {
          if (
            response.events.includes(
              'databases.*.collections.*.documents.*.create',
            ) ||
            response.events.includes(
              'databases.*.collections.*.documents.*.delete',
            )
          ) {
            fetchNotificationCount();
          }
        },
      );
    } catch (err) {
      console.log('Subscribe error:', err);
    }

    return () => {
      try {
        unsubscribe && unsubscribe();
      } catch {}
    };
  }, [user?.$id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotificationCount();
    }, [user?.$id]),
  );

  return notificationCount;
};
