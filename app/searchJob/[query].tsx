import { getJobsByRegionOrSkill } from '@/appwriteFuncs/appwriteJobsFuncs';
import ExploreHeader from '@/component/ExploreHeader';
import JobCard from '@/component/JobCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, StatusBar, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
  const { user } = useAuth();
  const { query: rawQuery } = useLocalSearchParams();
  const query = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;

  const {
    data: jobs,
    isLoading,
    refetch,
  } = useAppwrite(() =>
    getJobsByRegionOrSkill(user.locations.region, user.skills.$id, query),
  );

  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" />
      <ExploreHeader
        title="Explore Jobs"
        search="Search for Jobs..."
        isSearching={isLoading}
        initialQuery={query}
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
        />
      )}
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: Colors.gray200,
  },
});
