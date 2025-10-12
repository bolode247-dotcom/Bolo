import { getJobsByRegionOrSkill } from '@/appwriteFuncs/appwriteJobsFuncs';
import ExploreHeader from '@/component/ExploreHeader';
import JobCard from '@/component/JobCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
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
