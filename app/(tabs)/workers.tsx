import { getWorkersBySkillRegion } from '@/appwriteFuncs/appwriteWorkFuncs';
import EmptyState from '@/component/EmptyState';
import ExploreHeader from '@/component/ExploreHeader';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import WorkerCard from '@/component/WorkerCard';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Workers = () => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const {
    data: workers,
    isLoading,
    refetch,
  } = useAppwrite(() =>
    getWorkersBySkillRegion(user.locations.region, user.skills.$id),
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      {/* <StatusBar barStyle="light-content" /> */}
      <ExploreHeader
        title="Explore Workers"
        search="Search for Workers..."
        isRecruiter
      />
      {isLoading ? (
        <JobWorkerSkeleton />
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkerCard
              worker={item}
              style={styles.card}
              onPress={() => {
                router.push({
                  pathname: '/workerProfile',
                  params: { workerId: item?.id, isOffer: 'false' },
                });
              }}
              onBtnPress={() => {
                router.push({
                  pathname: '/(screens)/create',
                  params: { workerId: item?.id },
                });
              }}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() => (
            <EmptyState
              icon="briefcase-outline"
              title="No Jobs Found"
              subtitle="Post a job to find workers"
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
  );
};

export default Workers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.gray200,
  },
});
