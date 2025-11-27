import { getUnreadNotificationsCount } from '@/appwriteFuncs/appwriteGenFunc';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { client } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import { viewImage } from '@/Utils/helpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AppHeader = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState(0);

  const name = user?.name || 'Guest User';
  const location =
    [user?.locations?.division, user?.locations?.subdivision]
      .filter(Boolean)
      .join(', ') || 'Unknown Location';
  const avatar = user?.avatar || '';

  const fetchNotificationCount = async () => {
    if (!user?.$id) return;
    try {
      const count = await getUnreadNotificationsCount(user);
      setNotification(count);
    } catch (error) {
      console.error('❌ Error fetching notification count:', error);
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
          try {
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
          } catch (innerError) {
            console.log('Error handling real-time event:', innerError);
          }
        },
      );
    } catch (subError) {
      console.log('Subscription failed:', subError);
    }

    return () => {
      try {
        if (unsubscribe) unsubscribe();
      } catch (cleanError) {
        console.log('Safe unsubscribe error:', cleanError);
      }
    };
  }, [user?.$id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotificationCount();
    }, [user?.$id]),
  );
  return (
    <View style={styles.container}>
      {/* Profile + Info */}
      <TouchableOpacity
        style={styles.profileWrapper}
        onPress={() => {
          if (user?.userRole === 'Author') {
            // router.push('/(profile)/profileSettings');
          }
        }}
        activeOpacity={user?.userRole === 'Author' ? 0.9 : 1}
      >
        {/* Avatar or Ionicon fallback */}
        {avatar && avatar.trim() !== '' ? (
          <Image
            source={{ uri: viewImage(avatar) }}
            style={styles.avatarImage}
          />
        ) : (
          <Ionicons
            name="person-circle-outline"
            size={50}
            color={Colors.gray400}
          />
        )}

        {/* Name + Location */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={16}
              color={Colors.gray500}
              style={styles.icon}
            />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity
        style={styles.notifyWrapper}
        onPress={() => {
          router.push('/(screens)/notifications');
        }}
      >
        <MaterialCommunityIcons
          name="bell-outline"
          size={25}
          color={Colors.gray900}
        />
        {notification > 0 && (
          <Text style={styles.notifyBadge}>
            {notification > 9 ? '9+' : notification}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Sizes.sm,
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  infoContainer: {
    marginLeft: 8,
  },
  name: {
    fontSize: 14,
    color: Colors.gray700,
    fontFamily: 'PoppinsRegular',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: Colors.gray900,
    marginLeft: 4,
    fontFamily: 'PoppinsSemiBold',
  },
  icon: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  notifyWrapper: {
    position: 'relative',
  },
  notifyBadge: {
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    right: 0,
    textAlign: 'center',
    width: Sizes.md,
    height: Sizes.md,
    borderRadius: Sizes.sm,
    fontSize: Sizes.xsm,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: Sizes.md,
  },
});
