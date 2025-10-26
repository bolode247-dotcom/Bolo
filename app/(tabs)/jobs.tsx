import { getJobsByRegionOrSkill } from '@/appwriteFuncs/appwriteJobsFuncs';
import EmptyState from '@/component/EmptyState';
import ExploreHeader from '@/component/ExploreHeader';
import JobCard from '@/component/JobCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const JObs = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const {
    data: jobs,
    isLoading,
    refetch,
  } = useAppwrite(() =>
    getJobsByRegionOrSkill(user.locations.region, user.skills.$id),
  );

  useFocusEffect(
    React.useCallback(() => {
      // 🔵 When this tab is focused
      StatusBar.setBarStyle('light-content');

      return () => {
        StatusBar.setBarStyle('dark-content');
      };
    }, []),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
        <ExploreHeader title="Explore Jobs" search="Search for Jobs..." />
        {isLoading ? (
          <JobWorkerSkeleton />
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                style={styles.card}
                onPress={() => {
                  router.push({
                    pathname: '/jobDetails',
                    params: { jobId: item?.id, isOffer: 'false' },
                  });
                }}
              />
            )}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={() => (
              <EmptyState
                icon="briefcase-outline"
                title="No Jobs Posted"
                subtitle="Start by creating your first job listing."
                buttonLabel="Post a Job"
                onPressButton={() => router.push('/(screens)/create')}
              />
            )}
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
      </SafeAreaView>
    </>
  );
};

export default JObs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.gray200,
  },
});
