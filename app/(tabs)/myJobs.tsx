import { getJobsByRecruiterId } from '@/appwriteFuncs/appwriteJobsFuncs';
import ConfirmModal from '@/component/ConfirmModal';
import EmptyState from '@/component/EmptyState';
import ExploreHeader from '@/component/ExploreHeader';
import JobCard from '@/component/JobCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const MyJobs = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showBioConfirm, setShowBioConfirm] = React.useState(false);

  const fetchApplications = React.useCallback(() => {
    if (!user?.recruiters?.$id) return Promise.resolve([]);
    return getJobsByRecruiterId(user.recruiters?.$id);
  }, [user.recruiters?.$id]);

  const { data: myJobs, isLoading, refetch } = useAppwrite(fetchApplications);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filterJobs = useMemo(() => {
    if (!searchQuery.trim()) return myJobs || [];
    const q = searchQuery.trim().toLowerCase();
    return (myJobs || []).filter((job) => job.title.toLowerCase().includes(q));
  }, [myJobs, searchQuery]);

  const handleBioCheck = () => {
    if (
      user?.bio === '' ||
      user?.bio === null ||
      user?.avatar === '' ||
      user?.avatar === null
    ) {
      setShowBioConfirm(true);
      return false;
    }
    router.push('/(screens)/create');
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <ExploreHeader
        title="My Jobs"
        search="Filter jobs..."
        onSearch={setSearchQuery}
      />
      {isLoading ? (
        <JobWorkerSkeleton />
      ) : (
        <FlatList
          data={filterJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: '/myJobDetails',
                  params: { jobId: item?.id },
                });
              }}
              isRecruiter
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <EmptyState
              title="No jobs found"
              subtitle="You have not posted any job yet"
              icon="briefcase-outline"
              buttonLabel="Post a Job"
              onPressButton={() => handleBioCheck()}
              iconsStyle={styles.emptyIcon}
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
      {user?.role === 'recruiter' && filterJobs.length > 0 && (
        <View style={styles.fabContainer}>
          <View style={styles.hintWrapper}>
            <View style={styles.hintContainer}>
              <Text style={styles.hintText}>{t('home.createJob')}</Text>
            </View>
            <View style={styles.triangle} />
          </View>
          <TouchableOpacity
            style={styles.fabButton}
            activeOpacity={0.8}
            onPress={() => handleBioCheck()}
          >
            <AntDesign name="plus-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <ConfirmModal
        visible={showBioConfirm}
        title="Incomplete Profile"
        message="Please add a bio and profile picture before creating a job post."
        confirmText="Profile"
        cancelText="cancel"
        onConfirm={() => {
          setShowBioConfirm(false);
          router.push('/(profile)/profileSettings');
        }}
        onCancel={() => setShowBioConfirm(false)}
      />
    </SafeAreaView>
  );
};

export default MyJobs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.gray200,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
  },
  hintWrapper: {
    alignItems: 'center', // center triangle under badge
    marginBottom: 8,
  },
  hintContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  hintText: {
    fontSize: 10,
    color: Colors.white,
    fontFamily: 'PoppinsMedium',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8, // ✅ inverted
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginBottom: -1,
  },
  fabButton: {
    backgroundColor: 'green',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
  emptyIcon: {
    backgroundColor: Colors.white,
  },
});
