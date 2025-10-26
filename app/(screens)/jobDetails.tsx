import {
  acceptOffer,
  applyForJob,
  getJobById,
  rejectOffer,
  withdrawApp,
} from '@/appwriteFuncs/appwriteJobsFuncs';
import CustomButton from '@/component/CustomButton';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { client } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import useAppwrite from '@/lib/useAppwrite';
import { formatJobType, formatTimestamp, salaryType } from '@/Utils/Formatting';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

interface RealtimePayload {
  $id: string;
  jobs?: string;
  workers?: string;
  status?: string;
}

const JobDetails = () => {
  const { user } = useAuth();

  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [declineMode, setDeclineMode] = useState(false);
  const [reason, setReason] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // ✅ Fetch job details dynamically based on the logged-in user
  const fetchJob = useCallback(
    () => getJobById(jobId, user?.workers?.$id),
    [jobId, user?.workers?.$id],
  );

  const { data: job, isLoading, refetch } = useAppwrite(fetchJob);
  const [jobDetails, setJobDetails] = useState<any>(null);

  useEffect(() => {
    if (job) setJobDetails(job);
  }, [job]);

  // ✅ Realtime subscription (works with create, update, delete)
  useEffect(() => {
    const channels = [
      `databases.${appwriteConfig.dbId}.collections.${appwriteConfig.applicationsCol}.documents`,
      `databases.${appwriteConfig.dbId}.collections.${appwriteConfig.jobOffersCol}.documents`,
    ];

    const unsubscribe = client.subscribe(channels, async (event) => {
      const payload = event.payload as RealtimePayload;
      if (payload.jobs === jobId) {
        const updated = await getJobById(jobId, user?.workers?.$id);
        setJobDetails(updated);
      }
    });

    return () => unsubscribe();
  }, [jobId, user?.workers?.$id]);

  // --- ACTION HANDLERS ---
  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyForJob(jobId, user?.workers?.$id, reason);
      Alert.alert('Success', 'You have applied for this job.');
      setShowReasonModal(false);
      refetch();
    } catch (err) {
      console.error('Error applying:', err);
      Alert.alert('Error', 'Could not apply for the job.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const appId = jobDetails?.appId;
      if (!appId) return;
      await withdrawApp(appId, jobId);
      Alert.alert('Application withdrawn.');
      refetch();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not withdraw application.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAcceptOffer = async () => {
    try {
      await acceptOffer(jobDetails.offerId);
      Alert.alert('Success', 'You have accepted the offer.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineOffer = () => {
    setDeclineMode(true);
    setShowReasonModal(true);
  };

  const confirmDecline = async () => {
    setIsApplying(true);
    try {
      await rejectOffer(jobDetails.offerId, reason);
      setShowReasonModal(false);
      Alert.alert('You have declined the offer.');
      router.back();
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  const renderAvatar = () => {
    if (jobDetails?.recruiter?.avatar || jobDetails?.recruiter?.logo) {
      return (
        <Image
          source={{
            uri: jobDetails?.recruiter?.avatar || jobDetails?.recruiter?.logo,
          }}
          style={styles.avatar}
        />
      );
    }
    return (
      <View style={styles.avatarIcon}>
        <Ionicons
          name={jobDetails?.skill?.icon || 'briefcase-outline'}
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
            <Text style={styles.name}>{jobDetails?.title}</Text>
            <Text style={styles.address}>
              {jobDetails?.location?.region}, {jobDetails?.location?.division},{' '}
              {jobDetails?.location?.subdivision}
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
                  {salaryType(jobDetails?.salaryType).label}
                </Text>
                <Text style={styles.statValue} numberOfLines={2}>
                  {jobDetails?.salary}
                  {salaryType(jobDetails?.salaryType).rate}
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
                  {`${jobDetails?.applicantsCount || 0} / ${jobDetails?.maxApplicants || 0}`}
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
                  {jobDetails?.status === 'active' ? 'Open' : 'Closed'}
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
                <Text style={styles.statValue}>
                  {formatJobType(jobDetails?.type)}
                </Text>
              </View>
            </View>
          </View>
          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.bio}>{jobDetails?.description}</Text>

            <View style={styles.metaCol}>
              <Text style={styles.meta}>Expertise:</Text>
              <Text style={styles.sectionTitle}>{jobDetails?.skill?.name}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.meta}>Date Posted:</Text>
              <Text style={styles.sectionTitle}>
                {formatTimestamp(jobDetails?.createdAt || '')}
              </Text>
            </View>
          </View>
          {jobDetails?.isOffer && jobDetails?.offerStatus === 'pending' && (
            <View style={styles.btnRow}>
              <CustomButton
                title="Decline"
                onPress={() => handleDeclineOffer()} // open reason modal
                style={styles.btnOutline}
                textStyle={styles.cusBtnText}
                bgVariant="danger-outline"
                textVariant="danger-outline"
              />
              <CustomButton
                title="Accept"
                onPress={() => handleAcceptOffer()}
                style={styles.btn}
                textStyle={styles.cusBtnText}
              />
            </View>
          )}

          {jobDetails?.isApp && jobDetails?.appStatus === 'applied' && (
            <CustomButton
              title="Withdraw Application"
              onPress={() => {
                Alert.alert(
                  'Withdraw Application',
                  'Are you sure you want to withdraw this application?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'Withdraw',
                      onPress: () => handleWithdraw(),
                    },
                  ],
                );
              }}
              isLoading={isWithdrawing}
            />
          )}

          {!jobDetails?.isApp && !jobDetails?.isOffer && (
            <CustomButton
              title="Apply"
              onPress={() => setShowReasonModal(true)}
              // style={styles.btn}
            />
          )}

          <Modal
            visible={showReasonModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReasonModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {' '}
                  {declineMode
                    ? 'Reason for Declining Offer'
                    : 'Reason for Applying'}
                </Text>

                <Text style={styles.modalSubtitle}>
                  {declineMode
                    ? 'Why are you declining this offer?'
                    : 'Why are you applying for this job?'}
                </Text>

                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder={
                    declineMode
                      ? 'Enter reason for declining offer'
                      : 'Tell the recruiter why you are applying...'
                  }
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
                      setReason('');
                    }}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.reasonBtn,
                      {
                        backgroundColor: declineMode
                          ? Colors.danger
                          : Colors.success,
                      },
                    ]}
                    onPress={() =>
                      declineMode ? confirmDecline() : handleApply()
                    }
                  >
                    <Text style={styles.btnText}>Confirm</Text>
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
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  btnOutline: {
    backgroundColor: Colors.white,
    width: '48%',
  },
  cusBtnText: {
    fontSize: 16,
    paddingHorizontal: 2,
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
