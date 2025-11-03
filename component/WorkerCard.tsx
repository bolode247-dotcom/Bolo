import { Colors, Sizes } from '@/constants';
import { Worker } from '@/types/genTypes';
import { viewImage } from '@/Utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import CustomButton from './CustomButton';

type Props = {
  style?: ViewStyle;
  catWidth?: number;
  worker: Worker;
  onPress?: () => void;
  onBtnPress?: () => void;
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

// Utility to get initials from a name
const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const WorkerCard = ({ worker, style, onPress, onBtnPress }: Props) => {
  const bgColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)] ||
    Colors.gray50;

  const initials = worker?.name ? getInitials(worker?.name) : '';

  return (
    <TouchableOpacity
      style={[styles.card, { width: '100%' }, style]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.workerRow}>
          <View style={[styles.avatarContainer, { backgroundColor: bgColor }]}>
            {worker?.avatar ? (
              <Image
                source={{ uri: viewImage(worker?.avatar) }}
                style={styles.avatarStyle}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View>
            <Text
              style={styles.workerName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {worker?.name}
            </Text>
            <Text
              style={styles.workerSkills}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {worker?.skill?.name}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="star" size={14} color="gold" />
          <Text style={styles.rating}>{worker?.rating}</Text>
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {worker?.bio}
      </Text>

      <View style={styles.locationRow}>
        <Ionicons
          name="location-outline"
          size={Sizes.lg}
          color={Colors.gray900}
        />
        <Text style={styles.location} numberOfLines={1}>
          {worker?.location?.region}, {worker?.location?.subdivision}
        </Text>
      </View>

      <View style={styles.rowBetween}>
        <CustomButton
          title="Offer Job"
          onPress={onBtnPress}
          style={styles.button}
          textStyle={styles.buttonText}
          bgVariant="outline"
          textVariant="outline"
        />
      </View>

      {/* Job type */}
    </TouchableOpacity>
  );
};

export default WorkerCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray100,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    marginVertical: Sizes.xsm / 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
  avatarStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarText: {
    color: Colors.gray900,
    fontWeight: 'bold',
    fontSize: 16,
  },
  workerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  workerSkills: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray600,
    fontFamily: 'PoppinsRegular',
  },
  bio: {
    fontSize: Sizes.md,
    fontWeight: '500',
    color: Colors.gray600,
    fontFamily: 'PoppinsRegular',
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: Sizes.md,
    color: Colors.gray900,
    flexShrink: 1,
    marginLeft: Sizes.xsm,
    fontFamily: 'PoppinsSemiBold',
  },
  salary: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  salaryType: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray600,
  },
  date: {
    fontSize: 12,
    color: Colors.gray700,
  },
  applicants: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray800,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray800,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 3,
    marginTop: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  button: {
    alignSelf: 'flex-end',
    marginTop: 6,
    width: '40%',
    paddingVertical: 6,
    // paddingHorizontal: 10,
    borderRadius: Sizes.xl,
  },
  buttonText: {
    fontSize: Sizes.md,
    fontWeight: '600',
    marginHorizontal: 4,
    marginBottom: -3,
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
});
