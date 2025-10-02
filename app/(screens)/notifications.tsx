import { Colors, Sizes } from '@/constants';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DATA = [
  {
    id: '1',
    section: 'Today',
    items: [
      {
        id: '101',
        title: 'Your Application Confirmed!',
        message: 'Lorem Ipsum is simply dummy text typesetting.',
        time: '3 hrs ago',
        icon: { lib: 'AntDesign', name: 'check-circle', color: 'green' },
      },
      {
        id: '102',
        title: 'Google Declined Your Application.',
        message: 'Lorem Ipsum is simply dummy text typesetting.',
        time: '5 hrs ago',
        icon: { lib: 'AntDesign', name: 'close-circle', color: 'red' },
      },
      {
        id: '103',
        title: 'Figma Have Seen Your Application.',
        message: 'Lorem Ipsum is simply dummy text typesetting.',
        time: '10 hrs ago',
        icon: { lib: 'AntDesign', name: 'eye', color: 'orange' },
      },
    ],
  },
  {
    id: '2',
    section: 'Yesterday',
    items: [
      {
        id: '201',
        title: 'Security Update',
        message: 'Lorem Ipsum is simply dummy text typesetting.',
        time: '27 April, 2024',
        icon: { lib: 'MaterialIcons', name: 'security', color: 'blue' },
      },
      {
        id: '202',
        title: 'Password Update!',
        message: 'Lorem Ipsum is simply dummy text typesetting.',
        time: '27 April, 2024',
        icon: { lib: 'AntDesign', name: 'lock', color: 'purple' },
      },
    ],
  },
  {
    id: '3',
    section: '18 April, 2024',
    items: [
      {
        id: '301',
        title: 'Account Setup Successful!',
        message: 'Lorem Ipsum is simply dummy text typesetting.',
        time: '18 April, 2024',
        icon: { lib: 'AntDesign', name: 'smile', color: 'green' },
      },
    ],
  },
];

// map icon library name -> component
const ICONS = {
  AntDesign,
  MaterialIcons,
};

const renderIcon = (icon) => {
  const IconLib = ICONS[icon.lib];
  if (!IconLib) return null;
  return <IconLib name={icon.name} size={24} color={icon.color} />;
};

const Notifications = () => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.icon}>{renderIcon(item.icon)}</View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      <TouchableOpacity>
        <AntDesign name="ellipsis" size={18} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <FlatList
        data={DATA}
        keyExtractor={(section) => section.id}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.section}>{item.section}</Text>
            {item.items.map((notif) => (
              <View key={notif.id}>{renderItem({ item: notif })}</View>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
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
    fontSize: Sizes.lg,
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
});
