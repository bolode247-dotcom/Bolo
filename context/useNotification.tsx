import { getUnreadNotificationsCount } from '@/appwriteFuncs/appwriteGenFunc';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { useAuth } from './authContex';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotificationCount = async () => {
        if (!user?.$id) return;

        try {
          const count = await getUnreadNotificationsCount(user);
          setNotificationCount(count);
        } catch (err) {
          console.log('Error fetching notification count:', err);
        }
      };

      fetchNotificationCount();
    }, [user]),
  );

  return notificationCount;
};
