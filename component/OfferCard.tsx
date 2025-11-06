import { Colors, Sizes } from '@/constants';
import { JobWithDetails } from '@/types/genTypes';
import { formatJobType, formatSalary, paymentType } from '@/Utils/Formatting';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  cardWidth?: number;
  job: JobWithDetails;
  onPress?: () => void;
};

const pastelColors = ['#E0D7FF', '#D7F5E0', '#FFF3D7', '#FFD7E0'];
const screenWidth = Dimensions.get('window').width;

const JobOfferCard = ({ job, onPress, cardWidth = 2.7 }: Props) => {
  const categoryItemWidth = screenWidth / cardWidth;
  const bgColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)] ||
    Colors.gray50;
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { width: categoryItemWidth, backgroundColor: bgColor },
      ]}
      onPress={onPress}
    >
      {job?.skills?.icon && (
        <View style={styles.iconWrapper}>
          <Ionicons
            name={job?.skills.icon || 'briefcase-outline'}
            size={24}
            color={Colors.gray900}
          />
        </View>
      )}

      <Text style={styles.salary} numberOfLines={1}>
        <Text style={styles.paymentType}>
          {job?.paymentType !== 'contract'
            ? '' // Cast the return value to a string
            : 'budget:'}
        </Text>{' '}
        {formatSalary(job?.salary)}
        <Text style={styles.paymentType}>
          {paymentType(job?.paymentType).rate}
        </Text>
      </Text>
      {/* Job info */}
      <Text style={styles.title} numberOfLines={1}>
        {job?.title}
      </Text>

      {/* Location */}
      <Text style={styles.location} numberOfLines={2}>
        {job?.location?.region}, {job?.location?.subdivision},{' '}
        {job?.location?.division}
      </Text>

      {/* Job type tag */}
      <View style={styles.typeTag}>
        <Text style={styles.typeText}>{formatJobType(job?.type)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default JobOfferCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray50,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    marginHorizontal: Sizes.xsm / 2,
    height: 'auto',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20, // circle
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  skillIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  salary: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentType: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray600,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  location: {
    fontSize: 13,
    color: Colors.gray600,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: Sizes.sm,
  },
  typeTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray800,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    marginVertical: 5,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
