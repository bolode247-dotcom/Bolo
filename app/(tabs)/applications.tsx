import {
  getApplicationsByWorkerId,
  withdrawApp,
} from '@/appwriteFuncs/appwriteJobsFuncs';
import ApplicationCard from '@/component/ApplicationCard';
import ConfirmModal from '@/component/ConfirmModal';
import EmptyState from '@/component/EmptyState';
import ExploreHeader from '@/component/ExploreHeader';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Applications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<any>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [showReasonModal, setShowReasonModal] = React.useState(false);
  const [declineReason, setDeclineReason] = React.useState('');
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchApplications = React.useCallback(() => {
    if (!user?.workers?.$id) return Promise.resolve([]);
    return getApplicationsByWorkerId(user.workers.$id);
  }, [user?.workers?.$id]);

  const {
    data: applications,
    isLoading: isLoadingApps,
    refetch,
  } = useAppwrite(fetchApplications);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleWidthdraw = async (appId: string, jobId: string) => {
    setIsLoading(true);
    try {
      await withdrawApp(appId, jobId);
      showToast('Application widthdrawn.', 'success');
      await refetch();
    } catch (error) {
      console.error('Error widthdrawing application:', error);
      showToast('Error widthdrawing application.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionPress = (application: any) => {
    if (application.status === 'interview' || application.status === 'hired') {
      setSelectedApp(application);
      setShowModal(true);
    } else if (application.status === 'applied') {
      setSelectedApp(application);
      setShowConfirm(true);
    } else if (application.status === 'rejected') {
      router.push({
        pathname: '/(tabs)/jobs',
      });
    } else {
      router.push({
        pathname: '/(screens)/jobDetails',
        params: { jobId: application.job.id, isOffer: 'false', isApp: 'true' },
      });
    }
  };

  const handleInterviewResponse = async (response: 'accepted' | 'declined') => {
    if (!selectedApp) return;
    try {
      let newStatus = selectedApp.status;
      if (selectedApp.status === 'interview') {
        newStatus =
          response === 'accepted' ? 'interview_accepted' : 'interview_declined';
      } else if (selectedApp.status === 'hired') {
        newStatus =
          response === 'accepted' ? 'hire_confirmed' : 'hire_declined';
      }

      const payload: any = { status: newStatus };
      if (response === 'declined' && declineReason.trim()) {
        payload.declineReason = declineReason.trim();
      }

      console.log('Updating application with:', payload);
      setShowModal(false);
      setShowReasonModal(false);
      setDeclineReason('');
      refetch();
    } catch (error) {
      console.error('Error updating interview response:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ExploreHeader
          title="Applications"
          search="Search and apply for Jobs..."
        />
        {isLoadingApps ? (
          <JobWorkerSkeleton />
        ) : (
          <FlatList
            data={applications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ApplicationCard
                application={item}
                onActionPress={() => handleActionPress(item)}
                isLoading={isLoading}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <EmptyState
                title="No Application"
                subtitle="You have not applied for any job yet."
                buttonLabel="Apply for jobs"
                onPressButton={() => router.push('/(tabs)/jobs')}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary} // iOS spinner color
                colors={[Colors.primary]} // Android spinner color
              />
            }
          />
        )}
        <Modal
          visible={showModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                {selectedApp?.status === 'interview'
                  ? 'Interview Invitation'
                  : 'Hired'}
              </Text>
              <Text style={styles.modalSubtitle} numberOfLines={2}>
                {selectedApp?.status === 'interview'
                  ? 'You have been invited to an interview for the job'
                  : 'You have been hired for the job'}{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {selectedApp?.job?.title}
                </Text>
              </Text>

              {selectedApp?.instructions ? (
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>Instructions</Text>
                  <ScrollView style={{ maxHeight: 200 }}>
                    <Text style={styles.instructionsText}>
                      {selectedApp.instructions}
                    </Text>
                  </ScrollView>
                </View>
              ) : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: Colors.danger }]}
                  onPress={() => {
                    setShowModal(false);
                    setShowReasonModal(true); // open reason modal instead
                  }}
                >
                  <Text style={styles.btnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: Colors.primary }]}
                  onPress={() => handleInterviewResponse('accepted')}
                >
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showReasonModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowReasonModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reason for Declining</Text>

              <Text style={styles.modalSubtitle}>
                {selectedApp?.status === 'interview'
                  ? 'Please tell us why you are declining this interview.'
                  : selectedApp?.status === 'hired'
                    ? 'Please tell us why you are declining this job offer.'
                    : 'Please provide a reason for declining.'}
              </Text>

              <TextInput
                value={declineReason}
                onChangeText={setDeclineReason}
                placeholder={
                  selectedApp?.status === 'interview'
                    ? 'Type your reason for declining the interview...'
                    : 'Type your reason for declining the job offer...'
                }
                placeholderTextColor={Colors.gray600}
                multiline
                style={styles.input}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: Colors.gray400 }]}
                  onPress={() => {
                    setShowReasonModal(false);
                    setDeclineReason('');
                  }}
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: Colors.danger }]}
                  onPress={() => handleInterviewResponse('declined')}
                >
                  <Text style={styles.btnText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <ConfirmModal
        visible={showConfirm}
        title="Widthdraw Application"
        message="Are you sure you want to withdraw this application?"
        confirmText="Yes"
        cancelText="No"
        onConfirm={() => {
          setShowConfirm(false);
          handleWidthdraw(selectedApp?.id, selectedApp?.job?.id);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

export default Applications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  btn: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
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
