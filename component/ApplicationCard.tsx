import { Colors, Sizes } from '@/constants';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  style?: ViewStyle;
  application: any; // { job, status, createdAt, instructions }
  onActionPress?: (status: string) => void;
};

type StatusStyles = Record<string, { color: string; label: string }>;

const statusStyles: StatusStyles = {
  applied: { color: Colors.gray700, label: 'Applied' },
  seen: { color: Colors.secondary, label: 'Application Seen' },
  rejected: { color: Colors.danger, label: 'Rejected' },
  interview: { color: Colors.success, label: 'Interview Scheduled' },
  hired: { color: Colors.success, label: 'Hired' },
};

const ApplicationCard = ({ application, style, onActionPress }: Props) => {
  const { job, status, createdAt, instructions } = application;

  const statusStyle = statusStyles[status] || statusStyles.applied;

  const getActionLabel = () => {
    switch (status) {
      case 'applied':
        return 'Withdraw Application';
      case 'seen':
        return 'View Job';
      case 'rejected':
        return 'Find Similar Jobs';
      case 'interview':
        return 'View Interview Details';
      case 'hired':
        return 'View Instructions';
      default:
        return 'View Job';
    }
  };

  return (
    <View style={[styles.card, style]}>
      {/* Job title */}
      <Text style={styles.title}>{job?.title}</Text>

      {/* Recruiter name */}
      <Text style={styles.recruiterName} numberOfLines={2}>
        Posted by: {job?.recruiter?.name}
      </Text>

      {/* Status */}
      <View
        style={[
          styles.statusTag,
          { backgroundColor: statusStyle.color + '20' },
        ]}
      >
        <Text style={[styles.statusText, { color: statusStyle.color }]}>
          Status: {statusStyle.label}
        </Text>
      </View>

      {/* Date applied */}
      {createdAt && (
        <Text style={styles.infoText}>
          Applied on {new Date(createdAt).toLocaleDateString()}
        </Text>
      )}

      {/* Recruiter instructions */}
      {instructions && status !== 'applied' && status !== 'seen' && (
        <Text style={styles.infoText} numberOfLines={2}>
          Instructions: {instructions}
        </Text>
      )}

      {/* Action button */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: statusStyle.color }]}
        onPress={() => onActionPress?.(status)}
      >
        <Text style={styles.actionText}>{getActionLabel()}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ApplicationCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray200,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  recruiterName: {
    fontSize: 14,
    color: Colors.gray700,
    marginTop: 4,
  },
  statusTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  infoText: {
    fontSize: Sizes.sm,
    color: Colors.gray700,
    marginTop: 6,
    fontFamily: 'PoppinsRegular',
  },
  actionButton: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
  },
});
