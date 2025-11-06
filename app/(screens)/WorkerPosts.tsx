import { getRecommendedWorkerPosts } from '@/appwriteFuncs/appwriteWorkFuncs';
import EmptyState from '@/component/EmptyState';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import PostCard from '@/component/PostCard';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const WorkerPosts = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);
  const {
    data: post,
    isLoading,
    refetch,
  } = useAppwrite(() =>
    getRecommendedWorkerPosts(
      user?.locations?.region,
      user?.skills?.$id,
      user?.skills?.industry,
      10,
    ),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAvatarPress = (workerId: string | undefined) => {
    router.push({
      pathname: '/(screens)/workerProfile',
      params: { workerId },
    });
  };

  if (isLoading) return <JobWorkerSkeleton />;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FlatList
        data={post}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PostCard
            post={{
              caption: item.caption,
              image: item.image,
              createdAt: item.createdAt,
              worker: {
                name: item.worker?.name,
                avatar: item.worker?.avatar,
                isVerified: item.worker?.isVerified,
              },
              id: item.id,
            }}
            isRecruiter={true}
            showAvatar
            onImagePress={() => handleAvatarPress(item.worker?.id)}
            onAvatarPress={() => handleAvatarPress(item.worker?.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View style={{ flex: 1 }}>
            <EmptyState
              title="No Posts Found"
              icon="images"
              subtitle="Oops! No posts found."
              buttonLabel="Add Post"
            />
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsHorizontalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default WorkerPosts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Sizes.md,
  },
});
