import {
  deleteNotify,
  getNotifications,
  markNotificationsAsRead,
} from '@/appwriteFuncs/appwriteGenFunc';
import ConfirmModal from '@/component/ConfirmModal';
import EmptyState from '@/component/EmptyState';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import useAppwrite from '@/lib/useAppwrite';
import { formatTimeStampv2 } from '@/Utils/Formatting';
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useFocusEffect } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const NOTIFICATION_ICON_MAP: Record<
  string,
  { lib: any; defaultIcon: string; color: string }
> = {
  confirmed: { lib: AntDesign, defaultIcon: 'checkcircle', color: 'green' },
  declined: { lib: AntDesign, defaultIcon: 'closecircle', color: 'red' },
  seen: { lib: AntDesign, defaultIcon: 'eye', color: 'orange' },
  offered: { lib: Entypo, defaultIcon: 'briefcase', color: '#3c3dbf' },
  default: {
    lib: AntDesign,
    defaultIcon: 'bell',
    color: Colors.primary,
  },
};

const renderIcon = (type: string, iconName?: string) => {
  const cfg = NOTIFICATION_ICON_MAP[type] ?? NOTIFICATION_ICON_MAP.default;
  const IconLib = cfg.lib;

  return (
    <IconLib name={iconName || cfg.defaultIcon} size={24} color={cfg.color} />
  );
};

const groupByDateSections = (items: any[]) => {
  const groups: any = {
    Today: [],
    Yesterday: [],
    Other: {},
  };

  items.forEach((item) => {
    const formatted = formatTimeStampv2(item.time);
    const created = dayjs(item.time);

    if (created.isToday()) {
      groups.Today.push({ ...item, displayTime: formatted });
    } else if (created.isYesterday()) {
      groups.Yesterday.push({ ...item, displayTime: formatted });
    } else {
      const dateKey = created.format('D MMMM, YYYY');
      if (!groups.Other[dateKey]) groups.Other[dateKey] = [];
      groups.Other[dateKey].push({ ...item, displayTime: formatted });
    }
  });

  const sections: any[] = [];
  if (groups.Today.length > 0)
    sections.push({ title: 'Today', data: groups.Today });
  if (groups.Yesterday.length > 0)
    sections.push({ title: 'Yesterday', data: groups.Yesterday });

  Object.keys(groups.Other).forEach((date) => {
    sections.push({ title: date, data: groups.Other[date] });
  });

  return sections;
};

const Notifications = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedNotify, setSelectedNotify] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const fetchNotifications = React.useCallback(() => {
    if (!user) return Promise.resolve([]);
    return getNotifications(user);
  }, [user]);

  const {
    data: Notifications,
    isLoading,
    refetch,
  } = useAppwrite(fetchNotifications, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (!user?.$id || !Notifications?.length) return;
      markNotificationsAsRead(user.$id, Notifications).then(() => {});
    }, [Notifications, user]),
  );

  const sections = useMemo(() => {
    if (!Notifications) return [];
    return groupByDateSections(
      Notifications.map((n: any) => ({
        ...n,
        time: n.time, // ✅ use real timestamp
        iconName: n.icon ?? '', // ✅ backend icon string
      })),
    );
  }, [Notifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleDeleteNotify = async () => {
    try {
      await deleteNotify(selectedNotify?.$id);
      showToast('Notification Deleted', 'success');
    } catch (err: any) {
      console.error('Error deleting notification:', err.message || err);
      showToast(err.message, 'error');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.icon}>{renderIcon(item.iconName)}</View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.displayTime}</Text>
      </View>

      <TouchableOpacity
        style={styles.delete}
        onPress={() => {
          console.log(item);
          setShowConfirm(true);
        }}
      >
        <Feather name="trash-2" size={18} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) return <JobWorkerSkeleton />;

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.$id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.section}>{title}</Text>
        )}
        renderItem={({ item }) => renderItem({ item })}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={() => (
          <EmptyState
            title="No Notifications"
            subtitle="You don't have any notifications yet"
            icon="notifications-off-outline"
          />
        )}
      />
      <ConfirmModal
        visible={showConfirm}
        title="Widthdraw Application"
        message="Are you sure you want to withdraw this application?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          setShowConfirm(false);
          handleDeleteNotify();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    fontSize: Sizes.md,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.text,
    // marginVertical: Sizes.xsm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    marginBottom: Sizes.x3sm,
    backgroundColor: Colors.gray100,
  },
  icon: {
    marginRight: Sizes.xsm,
    backgroundColor: Colors.gray200,
    padding: Sizes.x2sm,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.text,
  },
  message: {
    fontSize: 13,
    color: Colors.gray700,
    marginVertical: 2,
  },
  time: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  delete: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
