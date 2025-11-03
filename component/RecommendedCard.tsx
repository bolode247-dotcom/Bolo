import { Colors, Sizes } from '@/constants';
import { Location, Skill } from '@/types/genTypes';
import { getInitials } from '@/Utils/Formatting';
import { viewImage } from '@/Utils/helpers';
import { Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type User = {
  $id: string;
  name: string;
  avatar?: string | null;
  skills: Skill[];
  locations?: Location | null;
  isVerified: boolean;
};

export type RecommendedCardProps = {
  users?: User;
  bio: string;
  rating: number;
  location: string;
  avatar: string;
};

type Props = {
  worker: RecommendedCardProps;
  onPress?: () => void;
};

const pastelColors = [
  '#E0D7FF',
  '#D7F5E0',
  '#FFF3D7',
  '#FFD7E0',
  '#FDE7D7',
  '#D7F0FF',
  '#FFE0F0',
  '#E0FFF3',
  '#FFF0D7',
  '#D7FFE0',
  '#F0D7FF',
];

const RecommendedWorkerCard = ({ worker, onPress }: Props) => {
  const { users: user, bio, avatar } = worker;
  const bgColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)] ||
    Colors.gray50;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top row: avatar + rate */}
      <View style={styles.headerRow}>
        <View style={[styles.logoContainer, { backgroundColor: bgColor }]}>
          {avatar ? (
            <Image
              source={{ uri: viewImage(avatar) }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.logoText}>{getInitials(user?.name)}</Text>
          )}
        </View>
        <View>
          {user?.isVerified ? (
            <MaterialIcons
              name="verified"
              size={22}
              color={Colors.primaryDark}
            />
          ) : (
            <Octicons name="unverified" size={22} color={Colors.primaryDark} />
          )}
        </View>
      </View>

      {/* Info below */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {user?.name}
        </Text>
        <Text style={styles.rate} numberOfLines={1} ellipsizeMode="tail">
          {user?.skills[0]?.name}
        </Text>
        <Text style={styles.role} numberOfLines={1} ellipsizeMode="tail">
          {bio}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={Colors.gray600} />
          <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
            {user?.locations?.division}, {user?.locations?.subdivision}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RecommendedWorkerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray50,
    borderRadius: Sizes.sm,
    padding: Sizes.sm,
    // paddingRight: Sizes.md,
    margin: Sizes.xsm / 2, // spacing between cards
    width: '48%', // two cards per row
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  rate: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  info: {},
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'PoppinsSemiBold',
  },
  role: {
    fontSize: 14,
    color: Colors.gray600,
    marginBottom: 2,
    fontFamily: 'PoppinsSemiBold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: Colors.gray700,
    // fontFamily: 'PoppinsRegular',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 2,
    marginRight: Sizes.sm,
  },
  location: {
    fontSize: 12,
    color: Colors.gray600,
    fontFamily: 'PoppinsRegular',
  },
  logoText: {
    color: Colors.gray900,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
});
