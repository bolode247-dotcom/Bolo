import { getOrCreateChat } from '@/appwriteFuncs/appwriteGenFunc';
import {
  acceptOffer,
  applyForJob,
  getJobById,
  rejectOffer,
  withdrawApp,
} from '@/appwriteFuncs/appwriteJobsFuncs';
import ConfirmModal from '@/component/ConfirmModal';
import CustomButton from '@/component/CustomButton';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { client } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import useAppwrite from '@/lib/useAppwrite';
import {
  formatJobType,
  formatSalaryRange,
  formatTimestamp,
  pastelColors,
  paymentType,
} from '@/Utils/Formatting';
import { viewImage } from '@/Utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ImageFooter from '@/component/ImageFooter';
import ImageViewing from 'react-native-image-viewing';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RealtimePayload {
  $id: string;
  jobs?: string;
  workers?: string;
  status?: string;
}

const JobDetails = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [showReasonModal, setShowReasonModal] = useState(false);
  const [declineMode, setDeclineMode] = useState(false);
  const [reason, setReason] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showWidthConfirm, setShowWidthConfirm] = useState(false);
  const [showBioConfirm, setShowBioConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [imagreSrc, setImageSrc] = useState('');
  const [recruiterBio, setRecruiterBio] = useState('');

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
    if (
      user?.bio === '' ||
      user?.bio === null ||
      user?.avatar === '' ||
      user?.avatar === null
    ) {
      setShowBioConfirm(true);
      return;
    }
    setIsApplying(true);
    try {
      await applyForJob(jobId, user?.workers?.$id, reason);
      showToast('You have applied for this job.', 'success');
      setShowReasonModal(false);
      refetch();
    } catch (err) {
      console.error('Error applying:', err);
      showToast('Could not apply for the job.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleBioCheck = () => {
    if (
      user?.bio === '' ||
      user?.bio === null ||
      user?.avatar === '' ||
      user?.avatar === null
    ) {
      setShowBioConfirm(true);
      return false;
    } else {
      setShowReasonModal(true);
    }
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const appId = jobDetails?.appId;
      if (!appId) return;

      await withdrawApp(appId, jobDetails?.recruiter?.userId);

      showToast('Application widthdrawn.', 'success');
      refetch();
    } catch (err) {
      console.error(err);
      showToast('Error widthdrawing application.', 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleAcceptOffer = async () => {
    setIsApplying(true);
    try {
      await acceptOffer(jobDetails?.offerId, jobDetails?.recruiter?.userId);
      showToast('You have accepted the offer.', 'success');
      await refetch();
    } catch (err) {
      console.error(err);
      showToast('Error accepting offer.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDeclineOffer = () => {
    setDeclineMode(true);
    setShowReasonModal(true);
  };

  const confirmDecline = async () => {
    setIsDeclining(true);
    try {
      await rejectOffer(
        jobDetails.offerId,
        reason,
        jobDetails?.recruiter?.userId,
      );
      setShowReasonModal(false);
      showToast('You have declined the offer.', 'success');
      router.back();
    } catch (err) {
      console.error(err);
      showToast('Error declining offer.', 'error');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleMessage = async () => {
    try {
      setIsApplying(true);
      const workerId = user?.workers?.$id;
      if (!jobDetails?.recruiter?.id || !workerId || !jobId) return;
      console.log('handleMessage');

      const chat = await getOrCreateChat(
        jobDetails?.recruiter?.id,
        workerId,
        jobId,
      );

      router.push({
        pathname: '/(screens)/messages',
        params: {
          chatId: chat?.$id,
        },
      });
    } catch (err) {
      console.error('❌ handleMessage error:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const renderAvatar = () => {
    if (jobDetails?.recruiter?.avatar || jobDetails?.recruiter?.logo) {
      return (
        <Pressable
          onPress={() => {
            setImageSrc(
              jobDetails?.recruiter?.avatar || jobDetails?.recruiter?.logo,
            );
            setRecruiterBio(jobDetails?.recruiter?.bio || '');
            setImageVisible(true);
          }}
        >
          <Image
            source={{
              uri:
                viewImage(jobDetails?.recruiter?.avatar) ||
                viewImage(jobDetails?.recruiter?.logo),
            }}
            style={styles.avatar}
          />
        </Pressable>
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
      <SafeAreaView
        style={styles.container}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            {renderAvatar()}
            <Text style={styles.address}>
              Posted By: {jobDetails?.recruiter?.name || 'N/A'}
            </Text>
            <Text style={styles.name}>{jobDetails?.title}</Text>
            <Text style={styles.address}>
              {jobDetails?.location?.region}, {jobDetails?.location?.division},{' '}
              {jobDetails?.location?.subdivision}
            </Text>
            <Text style={styles.address}>{job?.address}</Text>
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
                  {paymentType(jobDetails?.paymentType).label}
                </Text>
                <Text style={styles.statValue} numberOfLines={2}>
                  {formatSalaryRange(
                    jobDetails?.minSalary,
                    jobDetails?.maxSalary,
                  )}
                  {paymentType(jobDetails?.paymentType).rate}
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
                isLoading={isDeclining}
              />
              <CustomButton
                isLoading={isApplying}
                title={isApplying ? 'Accepting...' : 'Accept'}
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
                setShowWidthConfirm(true);
              }}
              isLoading={isWithdrawing}
            />
          )}

          {(jobDetails?.isApp && jobDetails?.appStatus === 'interview') ||
            (jobDetails?.isOffer && jobDetails?.offerStatus === 'accepted' && (
              <CustomButton
                title={isApplying ? 'Opening Chat...' : 'Message Employer'}
                onPress={() => handleMessage()}
                isLoading={isApplying}
              />
            ))}

          {!jobDetails?.isApp && !jobDetails?.isOffer && (
            <CustomButton title="Apply" onPress={() => handleBioCheck()} />
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
                  <Pressable
                    style={[
                      styles.reasonBtn,
                      { backgroundColor: Colors.gray400 },
                    ]}
                    onPress={() => {
                      setShowReasonModal(false);
                      setReason('');
                    }}
                    disabled={isDeclining || isApplying}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.reasonBtn,
                      {
                        backgroundColor: declineMode
                          ? Colors.danger
                          : Colors.success,
                      },
                      { opacity: isDeclining || isApplying ? 0.6 : 1 },
                    ]}
                    onPress={() =>
                      declineMode ? confirmDecline() : handleApply()
                    }
                    disabled={isDeclining || isApplying}
                  >
                    {isApplying && (
                      <ActivityIndicator size="small" color={Colors.white} />
                    )}
                    <Text style={styles.btnText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
          <ConfirmModal
            visible={showWidthConfirm}
            title="Widthdraw Application"
            message="Are you sure you want to withdraw your application?"
            confirmText="Yes"
            cancelText="No"
            onConfirm={() => {
              setShowWidthConfirm(false);
              handleWithdraw();
            }}
            onCancel={() => setShowWidthConfirm(false)}
          />
          <ConfirmModal
            visible={showBioConfirm}
            title="Incomplete Profile"
            message="Please add a bio and profile picture before applying for jobs."
            confirmText="Profile"
            cancelText="cancel"
            onConfirm={() => {
              setShowBioConfirm(false);
              router.push('/(profile)/profileSettings');
            }}
            onCancel={() => setShowBioConfirm(false)}
          />
        </ScrollView>
      </SafeAreaView>
      <ImageViewing
        images={[{ uri: viewImage(imagreSrc) }]}
        imageIndex={0}
        visible={imageVisible}
        onRequestClose={() => {
          setRecruiterBio('');
          setImageVisible(false);
        }}
        doubleTapToZoomEnabled
        FooterComponent={() => <ImageFooter caption={recruiterBio} />}
      />
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
