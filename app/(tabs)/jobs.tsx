import { getJobsByRegionOrSkill } from '@/appwriteFuncs/appwriteJobsFuncs';
import ExploreHeader from '@/component/ExploreHeader';
import JobCard from '@/component/JobCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchJobs = async (query = '') => {
    try {
      setIsLoading(true);
      const data = await getJobsByRegionOrSkill(
        user.locations.region,
        user.skills.$id,
        query,
      );
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchJobs();
  }, []);

  // search trigger
  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);

    try {
      await fetchJobs(query);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchJobs(searchQuery); // reload using current search term
    } finally {
      setIsRefreshing(false);
    }
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" />
      <ExploreHeader
        title="Explore Jobs"
        search="Search for Jobs..."
        onSearch={handleSearch}
        isSearching={isSearching}
      />
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
