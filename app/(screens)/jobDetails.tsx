import { applyForJob, getJobById } from '@/appwriteFuncs/appwriteJobsFuncs';
import CustomButton from '@/component/CustomButton';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { formatJobType, getTimeAgo, salaryType } from '@/Utils/Formatting';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

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

const JobDetails = () => {
  const { user } = useAuth();
  const { jobId, isOffer, isApp } = useLocalSearchParams<{
    jobId: string;
    isOffer: string;
    isApp: string;
  }>();

  const [showReasonModal, setShowReasonModal] = React.useState(false);
  const [applyReason, setApplyReason] = React.useState('');
  const [isApplying, setIsApplying] = React.useState(false);

  const fetchJob = useCallback(() => getJobById(jobId), [jobId]);

  const { data: job, isLoading, error, refetch } = useAppwrite(fetchJob);

  const handleJobApplication = async () => {
    if (applyReason.trim() === '') {
      Alert.alert('Please enter a valid reason.');
      return;
    }
    try {
      setIsApplying(true);
      await applyForJob(jobId, user?.workers?.$id, applyReason);
      setShowReasonModal(false);
      Alert.alert('Success', 'You have successfully applied for the job.');
      await refetch();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply for job.');
    } finally {
      setIsApplying(false);
    }
  };

  const renderAvatar = () => {
    if (job?.recruiter?.avatar || job?.recruiter?.logo) {
      return (
        <Image
          source={{ uri: job.recruiter.avatar || job.recruiter.logo }}
          style={styles.avatar}
        />
      );
    }
    return (
      <View style={styles.avatarIcon}>
        <Ionicons
          name={job?.skill?.icon || 'briefcase-outline'}
          size={60}
          color={Colors.gray900}
        />
      </View>
    );
  };

  if (isLoading) return <ProfileSkeleton />;
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Details',
          headerTitleAlign: 'center',
          headerRight: () => (
            <Ionicons
              name="help-circle-outline"
              size={28}
              color={Colors.text}
              style={{ marginRight: 16 }}
            />
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            {renderAvatar()}
            <Text style={styles.name}>{job?.title}</Text>
            <Text style={styles.address}>
              {job?.location?.region}, {job?.location?.division},{' '}
              {job?.location?.subdivision}
            </Text>
          </View>
          {/* Stats */}
          <View style={styles.statsRow}>
            {/* Salary */}
            <View style={styles.statBox}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: pastelColors[0] },
                ]}
              >
                <Ionicons name="cash-outline" size={20} color="#333" />
              </View>
              <View style={styles.statText}>
                <Text style={styles.statLabel}>
                  {salaryType(job?.salaryType).label}
                </Text>
                <Text style={styles.statValue} numberOfLines={2}>
                  {job?.salary}
                  {salaryType(job?.salaryType).rate}
                </Text>
              </View>
            </View>

            {/* Applicants */}
            <View style={styles.statBox}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: pastelColors[1] },
                ]}
              >
                <Ionicons name="people-outline" size={20} color="#333" />
              </View>
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Applicants</Text>
                <Text style={styles.statValue}>
                  {`${job?.applicantsCount || 0} / ${job?.maxApplicants || 0}`}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statBox}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: pastelColors[2] },
                ]}
              >
                <Ionicons name="briefcase-outline" size={20} color="#333" />
              </View>
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>
                  {job?.status === 'active' ? 'Open' : 'Closed'}
                </Text>
              </View>
            </View>

            {/* Time */}
            <View style={styles.statBox}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: pastelColors[3] },
                ]}
              >
                <Ionicons name="briefcase-outline" size={20} color="#333" />
              </View>
              <View style={styles.statText}>
                <Text style={styles.statLabel}>Job Type</Text>
                <Text style={styles.statValue}>{formatJobType(job?.type)}</Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.bio}>{job?.description}</Text>

            <View style={styles.metaCol}>
              <Text style={styles.meta}>Expertise:</Text>
              <Text style={styles.sectionTitle}>{job?.skill?.name}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.meta}>Date Posted:</Text>
              <Text style={styles.sectionTitle}>
                {getTimeAgo(job?.createdAt || '')}
              </Text>
            </View>
          </View>

          {isApp !== 'true' && (
            <View style={styles.btnSection}>
              {isOffer === 'true' ? (
                <View style={styles.btnRow}>
                  <CustomButton
                    title="Decline"
                    onPress={() => {}}
                    style={styles.btnOutline}
                    bgVariant="danger-outline"
                    textVariant="danger-outline"
                  />
                  <CustomButton
                    title="Accept"
                    onPress={() => setShowReasonModal(true)}
                    style={styles.btn}
                  />
                </View>
              ) : (
                <CustomButton
                  title="Apply"
                  onPress={() => setShowReasonModal(true)}
                />
              )}
            </View>
          )}
          <Modal
            visible={showReasonModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReasonModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Reason for Applying</Text>

                <Text style={styles.modalSubtitle}>
                  Why should we hire you?
                </Text>

                <TextInput
                  value={applyReason}
                  onChangeText={setApplyReason}
                  placeholder={'Tell the recruiter why you are applying...'}
                  placeholderTextColor={Colors.gray600}
                  multiline
                  style={styles.input}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.reasonBtn,
                      { backgroundColor: Colors.gray400 },
                    ]}
                    onPress={() => {
                      setShowReasonModal(false);
                      setApplyReason('');
                    }}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reasonBtn,
                      { backgroundColor: Colors.success },
                    ]}
                    onPress={() => handleJobApplication()}
                  >
                    <Text style={styles.btnText}>Submit</Text>
                    {isApplying && (
                      <ActivityIndicator size="small" color={Colors.white} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default JobDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.md,
  },
  header: { alignItems: 'center', marginTop: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontFamily: 'PoppinsSemiBold', marginTop: 8 },
  address: { fontSize: 14, color: Colors.textLight },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: Sizes.sm,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    flexBasis: '48%',
    padding: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statText: {
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    fontFamily: 'PoppinsSemiBold',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray800,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    marginBottom: 8,
  },
  bio: { fontSize: 14, color: Colors.gray700, fontFamily: 'PoppinsRegular' },
  metaCol: {
    flexDirection: 'row',
    gap: Sizes.sm,
    marginTop: 8,
  },
  meta: { fontSize: 15, color: Colors.gray700, fontFamily: 'PoppinsSemiBold' },
  metaData: { fontSize: 15, color: Colors.text },
  samplesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleImg: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  placeholder: {
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSection: { marginBottom: 16 },
  btnRow: {
    flexDirection: 'row',
    gap: Sizes.sm,
  },
  btn: {
    width: '48%',
  },
  btnOutline: {
    backgroundColor: Colors.white,
    width: '48%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  reasonBtn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    gap: Sizes.xsm,
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: Colors.gray100,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: Colors.gray700,
  },
  instructionsText: {
    fontSize: 15,
    color: Colors.gray600,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: Colors.gray700,
    marginBottom: 20,
  },
});
