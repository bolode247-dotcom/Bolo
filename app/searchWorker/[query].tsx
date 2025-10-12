import { getWorkersBySearch } from '@/appwriteFuncs/appwriteWorkFuncs';
import ExploreHeader from '@/component/ExploreHeader';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import WorkerCard from '@/component/WorkerCard';
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
    data: workers,
    isLoading,
    refetch,
  } = useAppwrite(() => getWorkersBySearch(query));

  useEffect(() => {
    refetch();
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left']}>
      <StatusBar barStyle="light-content" />
      <ExploreHeader
        title="Explore Workers"
        search="Search for Workers..."
        isSearching={isLoading}
        initialQuery={query}
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
                  params: { workerId: item?.id },
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
              No Worker found.
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
