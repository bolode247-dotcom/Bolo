import { getJobsByRecruiterId } from '@/appwriteFuncs/appwriteJobsFuncs';
import ExploreHeader from '@/component/ExploreHeader';
import JobCard from '@/component/JobCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
  StatusBar,
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

  const fetchApplications = React.useCallback(() => {
    if (!user?.recruiters?.$id) return Promise.resolve([]);
    return getJobsByRecruiterId(user.recruiters?.$id);
  }, [user.recruiters?.$id]);

  const {
    data: applications,
    isLoading,
    refetch,
  } = useAppwrite(fetchApplications);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" />
      <ExploreHeader title="My Jobs" search="Search and apply for Jobs..." />
      {isLoading ? (
        <JobWorkerSkeleton />
      ) : (
        <FlatList
          data={applications}
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
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                color: Colors.gray600,
              }}
            >
              No jobs found.
            </Text>
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
      {user?.role === 'recruiter' && (
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
            onPress={() => router.push('/(screens)/create')}
          >
            <AntDesign name="plus-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
});
