import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type RecommendedCardProps = {
  users: object;
  payRate: string;
  rating: number;
  location: string;
  avatar?: string;
};

type Props = {
  worker: RecommendedCardProps;
  onPress?: () => void;
};

const RecommendedWorkerCard = ({ worker, onPress }: Props) => {
  const { users, payRate, rating, location, avatar } = worker;
  console.log('top worker', users.locations);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top row: avatar + rate */}
      <View style={styles.headerRow}>
        <Image
          source={
            avatar ? { uri: avatar } : require('@/assets/icons/profile.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.rate}>{payRate}</Text>
      </View>

      {/* Info below */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {users?.name}
        </Text>
        <Text style={styles.role} numberOfLines={1} ellipsizeMode="tail">
          {users.skills[0]?.name}
        </Text>
        <View style={styles.row}>
          <Ionicons name="star" size={14} color="gold" />
          <Text style={styles.rating}>{rating} (ratings)</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={Colors.gray600}
            style={styles.icon}
          />
          <Text style={styles.location} numberOfLines={1} ellipsizeMode="tail">
            {users.locations.division}, {users.locations.subdivision}
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
    fontFamily: 'PoppinsRegular',
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
});
