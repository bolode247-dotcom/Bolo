import {
  deleteJob,
  getMyJobById,
  togleJobStatus,
} from '@/appwriteFuncs/appwriteJobsFuncs';
import CustomButton from '@/component/CustomButton';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { formatJobType, formatTimestamp, salaryType } from '@/Utils/Formatting';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
  const { jobId } = useLocalSearchParams<{
    jobId: string;
    isOffer: string;
    isApp: string;
  }>();

  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchJob = useCallback(() => getMyJobById(jobId), [jobId]);

  const { data: job, isLoading, error, refetch } = useAppwrite(fetchJob);
  const [status, setStatus] = React.useState(job?.status || 'active');

  useEffect(() => {
    if (job?.status) {
      setStatus(job.status);
    }
  }, [job?.status]);

  const handleJobDeletion = async () => {
    try {
      setIsDeleting(true);
      await deleteJob(jobId);
      Alert.alert('Success', 'Job deleted successfully.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Oops! Failed to delete job.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleJobStatus = async () => {
    try {
      console.log('job status before toggle', status);
      const newStatus = status === 'active' ? 'closed' : 'active';
      setIsDeleting(true);
      await togleJobStatus(jobId, newStatus);
      Alert.alert('Success', 'Job status updated successfully.');
      setStatus(newStatus);
      console.log('job status after toggle', status);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update job status.');
    } finally {
      setIsDeleting(false);
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
          animation: 'slide_from_bottom',
          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  `${status === 'active' ? 'Close' : 'Open'} Job`,
                  `Are you sure you want to ${status === 'active' ? 'close' : 'open'} this job?`,
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: `${status === 'active' ? 'Close' : 'Open'}`,
                      onPress: () => {
                        toggleJobStatus();
                      },
                    },
                  ],
                );
              }}
            >
              <AntDesign
                name={status === 'active' ? 'eye' : 'eye-invisible'}
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView
        style={styles.container}
        edges={['right', 'left', 'bottom']}
      >
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.appContainer}
            onPress={() =>
              router.push({ pathname: '/applicants', params: { jobId: jobId } })
            }
          >
            <View style={styles.applicants}>
              <Text style={styles.appText}>Applicants</Text>
              <Text style={styles.appCount}>
                {job?.applicantsCount}{' '}
                {job?.applicantsCount === 1 ? 'applicant' : 'applicants'}
              </Text>
            </View>
            <View style={styles.appRight}>
              <View style={styles.appAvatars}>
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={Colors.gray300}
                  style={{ marginLeft: 0 }}
                />
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={Colors.gray300}
                  style={{ marginLeft: -10 }}
                />
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={Colors.gray300}
                  style={{ marginLeft: -10 }}
                />
                <Ionicons
                  name="person-circle-outline"
                  size={30}
                  color={Colors.gray300}
                  style={{ marginLeft: -10 }}
                />
              </View>

              <View style={styles.appArrow}>
                <Ionicons
                  name="arrow-forward-circle"
                  size={35}
                  color={Colors.gray300}
                />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.statsRow}>
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
                  {status === 'active' ? 'Open' : 'Closed'}
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
                {formatTimestamp(job?.createdAt || '')}
              </Text>
            </View>
          </View>

          <View style={styles.btnRow}>
            <CustomButton
              title="Delete Job"
              onPress={() => handleJobDeletion()}
              style={styles.btnOutline}
              bgVariant="danger-outline"
              textVariant="danger-outline"
              isLoading={isDeleting}
            />
          </View>
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
  btnOutline: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    // width: '48%',
  },
  appContainer: {
    backgroundColor: Colors.secondaryDark,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Sizes.sm,
    borderRadius: Sizes.sm,
    marginVertical: Sizes.sm,
  },
  applicants: {
    flexDirection: 'column',
    gap: Sizes.sm,
  },
  appText: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray400,
  },
  appCount: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray100,
  },
  appRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appAvatars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  appArrow: {
    marginLeft: 2,
  },
});
