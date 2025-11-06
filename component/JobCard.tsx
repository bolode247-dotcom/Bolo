import { Colors, Sizes } from '@/constants';
import { JobWithDetails } from '@/types/genTypes';
import {
  formatJobType,
  formatSalaryRange,
  formatTimestamp,
  getInitials,
  getRandomPastelColor,
  paymentType,
} from '@/Utils/Formatting';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  style?: ViewStyle;
  catWidth?: number;
  job: JobWithDetails;
  onPress?: () => void;
  isRecruiter?: boolean;
};

const JobCard = ({ job, style, onPress, isRecruiter = false }: Props) => {
  const initials =
    job?.recruiter?.name && !isRecruiter
      ? getInitials(job?.recruiter.name)
      : getInitials(job?.title);

  return (
    <TouchableOpacity
      style={[styles.card, { width: '100%' }, style]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.recruiterRow}>
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: getRandomPastelColor() },
            ]}
          >
            {job?.recruiter?.logo ? (
              <Image
                source={{ uri: job?.recruiter.logo }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.logoText}>{initials}</Text>
            )}
          </View>
          <Text
            style={styles.recruiterName}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {job?.recruiter?.name}
          </Text>
        </View>
        <Text style={styles.date}>{formatTimestamp(job?.createdAt)}</Text>
      </View>

      {/* Job title */}
      <Text style={styles.title} numberOfLines={1}>
        {job?.title}
      </Text>

      {/* Location & Salary */}
      <View style={styles.rowBetween}>
        <Text style={styles.location} numberOfLines={1}>
          {job?.location?.region}, {job?.location?.subdivision}
        </Text>
        <Text style={styles.salary}>
          <Text style={styles.paymentType}>
            {job?.paymentType !== 'contract' ? '' : 'budget:'}
          </Text>{' '}
          {formatSalaryRange(job?.minSalary, job?.maxSalary, 'CFA')}
          <Text style={styles.paymentType}>
            {paymentType(job?.paymentType).rate}
          </Text>
        </Text>
      </View>

      {/* Time posted & Applicants */}
      <View style={styles.rowBetween}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{formatJobType(job?.type)}</Text>
        </View>
        <Text style={styles.applicants}>
          {`${job?.applicantsCount || 0} / ${job?.maxApplicants || 0} ${
            job?.applicantsCount === 1 ? 'applicant' : 'applicants'
          }`}
        </Text>
      </View>

      {/* Job type */}
    </TouchableOpacity>
  );
};

export default JobCard;

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
  recruiterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '50%',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  logoText: {
    color: Colors.gray900,
    fontWeight: 'bold',
    fontSize: 16,
  },
  recruiterName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.gray600,
    flexShrink: 1,
  },
  salary: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  paymentType: {
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
});
