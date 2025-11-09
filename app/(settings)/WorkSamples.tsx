import {
  deleteWorkSample,
  getWorkSample,
} from '@/appwriteFuncs/appwriteWorkFuncs';
import ConfirmModal from '@/component/ConfirmModal';
import EmptyState from '@/component/EmptyState';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import PostCard from '@/component/PostCard';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import useAppwrite from '@/lib/useAppwrite';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkSamples = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [refreshing, setRefreshing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [selectedPost, setSelectedPost] = React.useState<any>(null);

  const fetchWorkers = useCallback(() => {
    return getWorkSample(user?.workers?.$id);
  }, []);

  const { data: workSamples, isLoading, refetch } = useAppwrite(fetchWorkers);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, []),
  );

  const handleEdit = (item: any) => {
    // Example navigation or action
    router.push({
      pathname: '/EditWorkSample',
      params: { postId: item.$id, caption: item.caption, image: item.image },
    });
  };

  const handleDelete = async () => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      await deleteWorkSample(selectedPost.$id, selectedPost.image);
      showToast('Post deleted successfully', 'success');
      await refetch();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      showToast(error.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) return <JobWorkerSkeleton />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Work Samples',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/AddWorkSample')}>
              <Text
                style={{ color: Colors.primaryDark, fontFamily: 'PoppinsBold' }}
              >
                Add
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView edges={['bottom']} style={styles.container}>
        <FlatList
          data={workSamples}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PostCard
              post={{
                caption: item.caption,
                image: item.image,
                createdAt: item.createdAt,
                id: item.id,
              }}
              onEdit={() => handleEdit(item)}
              onDelete={() => {
                setShowConfirm(true);
                setSelectedPost(item);
              }}
              isDeleting={isDeleting}
            />
          )}
          ListEmptyComponent={() => (
            <View style={{ flex: 1 }}>
              <EmptyState
                title="No sample"
                icon="images"
                subtitle="Add your work samples to increase your chances of getting hired."
                buttonLabel="Add Post"
                onPressButton={() => router.push('/(profile)/AddWorkSample')}
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
        />
        <ConfirmModal
          visible={showConfirm}
          title="Delete Post"
          message="Are you sure you want to delete this post?"
          confirmText="Yes"
          cancelText="No"
          onConfirm={() => {
            setShowConfirm(false);
            handleDelete();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      </SafeAreaView>
    </>
  );
};

export default WorkSamples;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Sizes.md,
  },
});
