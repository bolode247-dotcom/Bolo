import {
  getOrCreateChat,
  sendPushNotification,
} from '@/appwriteFuncs/appwriteGenFunc';
import {
  scheduleInterview,
  updateApplicantStatus,
  updateInterview,
} from '@/appwriteFuncs/appwriteJobsFuncs';
import {
  getInterview,
  getWorkerById,
  getWorkSample,
} from '@/appwriteFuncs/appwriteWorkFuncs';
import CustomButton from '@/component/CustomButton';
import ImageFooter from '@/component/ImageFooter';
import InterviewModal from '@/component/InterviewModal';
import PostCard from '@/component/PostCard';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import useAppwrite from '@/lib/useAppwrite';
import { viewImage } from '@/Utils/helpers';
import { Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageViewing from 'react-native-image-viewing';

import { SafeAreaView } from 'react-native-safe-area-context';

const WorkerProfileScreen = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { workerId, isRecruiter, reason, status, appId, jobId, interviewId } =
    useLocalSearchParams<{
      workerId: string;
      isRecruiter: string;
      reason: string;
      status: string;
      appId: string;
      jobId: string;
      interviewId: string;
    }>();
  const [imageVisible, setImageVisible] = useState(false);
  const [postCaption, setPostCaption] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentInterviewId, setCurrentInterviewId] = useState(interviewId);

  const [interviewModalVisible, setInterviewModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  const [interviewInstructions, setInterviewInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSheduling, setIsScheduling] = useState(false);

  // If editing
  type InterviewType = {
    id: string;
    time: string;
    instructions: string;
    date: string;
    status?: string;
  };
  const [existingInterview, setExistingInterview] =
    useState<InterviewType | null>(null);

  const fetchWorker = useCallback(() => getWorkerById(workerId), [workerId]);
  const fetchInterview = useCallback(
    () => getInterview(currentInterviewId),
    [currentInterviewId],
  );

  const { data: worker, isLoading, error, refetch } = useAppwrite(fetchWorker);
  const { data: interview, refetch: refetchInterview } =
    useAppwrite(fetchInterview);
  const { data: post, isLoading: postLoading } = useAppwrite(() =>
    getWorkSample(workerId),
  );

  const otherSkill = worker?.workers?.otherSkill
    ? `${worker.workers.otherSkill}`
    : '';

  // ✅ Avatar placeholder
  const renderAvatar = () => {
    if (worker?.avatar) {
      return (
        <TouchableOpacity
          onPress={() => {
            setImageVisible(true);
            setImage(worker?.avatar);
          }}
        >
          <Image
            source={{ uri: viewImage(worker.avatar) }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      );
    }
    return (
      <Ionicons
        name="person-circle-outline"
        size={100}
        color={Colors.gray400}
      />
    );
  };

  // ✅ Work samples
  const renderSamples = () => {
    if (post && post?.length > 0) {
      return (
        <FlatList
          data={post}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              isRecruiter={true}
              cardStyles={styles.card}
              onImagePress={() => {
                setImage(item.image);
                setPostCaption(item.caption);
                setImageVisible(true);
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          ListEmptyComponent={() =>
            postLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={{ color: Colors.gray500 }}>
                No work samples found.
              </Text>
            )
          }
        />
      );
    }

    // fallback placeholders
    return [1, 2, 3].map((i) => (
      <View key={i} style={[styles.sampleImg, styles.placeholder]}>
        <Ionicons name="image-outline" size={43} color={Colors.gray400} />
      </View>
    ));
  };

  const handleStatusChange = async (
    newStatus: 'seen' | 'interview' | 'hired',
  ) => {
    setLoading(true);

    try {
      await updateApplicantStatus(appId, newStatus);
      sendPushNotification({
        type: 'application_submitted',
        applicationId: appId,
        messageTitle: 'Application Update',
        message: `${
          newStatus === 'seen'
            ? 'Your application has been seen!'
            : newStatus === 'interview'
              ? 'You have been shortlisted for an interview!'
              : 'Congratulations! You have been hired!'
        }`,
      });
      setCurrentStatus(newStatus);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      setLoading(true);
      const recruiterId = user?.recruiters?.$id;
      if (!recruiterId || !workerId || !jobId) return;
      console.log('handleMessage');

      const chat = await getOrCreateChat(recruiterId, workerId, jobId);

      router.push({
        pathname: '/(screens)/messages',
        params: {
          chatId: chat?.$id,
        },
      });
    } catch (err) {
      console.error('❌ handleMessage error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedDate || !selectedTime || !interviewInstructions.trim()) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (isSheduling) return;

    setIsScheduling(true);

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      const res = await scheduleInterview(
        appId,
        interviewInstructions,
        formattedTime,
        formattedDate,
      );

      await handleStatusChange('interview');

      if (res) {
        sendPushNotification({
          type: 'interview_scheduled',
          interviewId: res,
        });
        setCurrentInterviewId(res);
      }

      showToast('Interview scheduled successfully', 'success');
      setInterviewModalVisible(false);
    } catch (err) {
      console.log(err);
      showToast('Failed to schedule interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleUpdateInterview = async () => {
    if (!selectedDate || !selectedTime || !interviewInstructions.trim()) {
      showToast('Please fill all fields', 'error');
      return;
    }

    if (isSheduling) return;

    setIsScheduling(true);

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];

      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      await updateInterview(
        interviewId,
        interviewInstructions,
        formattedTime,
        formattedDate,
      );

      sendPushNotification({
        type: 'interview_scheduled',
        interviewId,
        messageTitle: 'Interview Updated',
        message: 'Your interview details have been updated.',
      });

      if (currentStatus !== 'interview') {
        await handleStatusChange('interview');
      }

      await refetchInterview();

      showToast('Interview updated successfully', 'success');
      setInterviewModalVisible(false);
    } catch (err) {
      console.log('Error updating interview:', err);
      showToast('Failed to update interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  useEffect(() => {
    if (interview) {
      setExistingInterview(interview);
      setSelectedDate(new Date(interview.date));
      const [h, m] = interview.time.split(':');
      const timeObj = new Date();
      timeObj.setHours(parseInt(h));
      timeObj.setMinutes(parseInt(m));
      timeObj.setSeconds(0);

      setSelectedTime(timeObj);
      setInterviewInstructions(interview.instructions);
    } else {
      // fresh schedule
      setExistingInterview(null);
      setSelectedDate(new Date());
      setSelectedTime(new Date());
      setInterviewInstructions('');
    }
  }, [interview]);

  const openInterviewModal = () => {
    setInterviewModalVisible(true);
  };

  if (isLoading) return <ProfileSkeleton />;
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Ionicons
              name="heart-outline"
              size={28}
              color={Colors.text}
              style={{ marginRight: 16 }}
            />
          ),
        }}
      />
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            {renderAvatar()}
            <Text style={styles.name}>
              {worker?.name}{' '}
              {worker?.isVerified ? (
                <MaterialIcons
                  name="verified"
                  size={22}
                  color={Colors.primaryDark}
                />
              ) : (
                <Octicons
                  name="unverified"
                  size={22}
                  color={Colors.primaryDark}
                />
              )}
            </Text>
          </View>
          {/* Stats */}
          {currentStatus === 'seen' || currentStatus === 'interview' ? (
            <View style={styles.statsRow}>
              <CustomButton
                title="Message"
                onPress={() => handleMessage()}
                style={[styles.btn, { backgroundColor: Colors.white }]}
                textVariant="outline"
                bgVariant="outline"
                isLoading={loading}
              />
              <CustomButton
                title={
                  existingInterview ? 'Edit Interview' : 'Schedule Interview'
                }
                onPress={() => openInterviewModal()}
                style={styles.btn}
                textStyle={{ fontSize: Sizes.sm }}
              />
            </View>
          ) : currentStatus === 'applied' ? (
            <View style={styles.statsRow}>
              <CustomButton
                title="Select"
                onPress={() => handleStatusChange('seen')}
                isLoading={loading}
              />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <CustomButton
                title="Offer a Job"
                onPress={() =>
                  router.push({
                    pathname: '/(screens)/create',
                    params: { workerId: worker?.$id },
                  })
                }
              />
            </View>
          )}
          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.address}>
              {worker?.locations?.region}, {worker?.locations?.division},{' '}
              {worker?.locations?.subdivision}
            </Text>
            {worker?.otherLocation && (
              <Text style={styles.address}>{worker?.otherLocation}</Text>
            )}
          </View>
          {/* Interview */}
          {interview && (
            <View style={styles.section}>
              <>
                <Text style={styles.sectionTitle}>Interview</Text>
                <View style={[styles.metaCol, { marginTop: 0 }]}>
                  <Text style={styles.meta}>Date:</Text>
                  <Text style={styles.sectionTitle}>{interview.date}</Text>
                </View>
                <View
                  style={[styles.metaCol, { marginTop: 0, marginBottom: 0 }]}
                >
                  <Text style={styles.meta}>Time:</Text>
                  <Text style={styles.sectionTitle}>{interview.time}</Text>
                </View>
              </>
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {worker?.name}</Text>
            <Text style={styles.bio}>{worker?.bio || 'No bio yet!'}</Text>

            <View style={styles.metaCol}>
              <Text style={styles.meta}>Main Skill:</Text>
              <Text style={styles.sectionTitle}>{worker?.skills.name_en}</Text>
            </View>
            {otherSkill && (
              <View style={styles.metaCol}>
                <Text style={styles.meta}>Other skills:</Text>
                <Text style={styles.sectionTitle}>{otherSkill}</Text>
              </View>
            )}
          </View>
          {isRecruiter === 'true' && reason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why you should hire me</Text>
              <Text style={styles.bio}>{reason}</Text>
            </View>
          )}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Samples</Text>
            <View style={styles.samplesRow}>{renderSamples()}</View>
          </View>
        </ScrollView>
        <ImageViewing
          images={[{ uri: viewImage(image) }]}
          imageIndex={0}
          visible={imageVisible}
          onRequestClose={() => {
            setPostCaption('');
            setImageVisible(false);
          }}
          doubleTapToZoomEnabled
          FooterComponent={() => <ImageFooter caption={postCaption} />}
        />
      </SafeAreaView>

      <InterviewModal
        visible={interviewModalVisible}
        onClose={() => setInterviewModalVisible(false)}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        interviewInstructions={interviewInstructions}
        setInterviewInstructions={setInterviewInstructions}
        onSubmit={
          existingInterview ? handleUpdateInterview : handleScheduleInterview
        }
        loading={isSheduling}
        isEditing={!!existingInterview}
      />
    </>
  );
};

export default WorkerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.md,
  },
  header: { alignItems: 'center', marginTop: 16, textAlign: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: {
    fontSize: 20,
    fontFamily: 'PoppinsSemiBold',
    marginTop: 8,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  address: { fontSize: 14, color: Colors.textLight },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: Sizes.sm,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    padding: Sizes.sm,
    borderRadius: Sizes.sm,
    justifyContent: 'center',
    gap: Sizes.x3sm,
    flex: 1,
  },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 12, color: Colors.textLight },
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
    flexWrap: 'wrap', // <== allow wrapping in row
    alignItems: 'flex-start',
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
  card: {
    width: 300,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullImage: { flex: 1, width: '100%', height: '100%', aspectRatio: 2 / 2 },
  postCaption: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    marginTop: Sizes.md,
    paddingHorizontal: Sizes.md,
  },
  btn: {
    width: '48%',
    paddingVertical: 6,
    paddingHorizontal: 5,
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
