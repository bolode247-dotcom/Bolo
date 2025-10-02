import { getTopSkills } from '@/appwriteFuncs/appwriteWorkFuncs';
import CategorySection from '@/component/CategorySection';
import WorkerSkeletonList from '@/component/WorkerByCartSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkersByCategory = () => {
  const { user } = useAuth();

  // Data
  const { data: workers, isLoading } = useAppwrite(() => getTopSkills());

  const onSelect = (categoryId: string) => {
    router.push({ pathname: '/workerByCat', params: { categoryId } });
  };
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      {/* Worker List */}
      <FlatList
        data={workers?.topSkills}
        keyExtractor={(item) => item.id}
        numColumns={user?.role === 'recruiter' ? 2 : 1}
        columnWrapperStyle={
          user?.role === 'recruiter'
            ? { justifyContent: 'space-between' }
            : undefined
        }
        renderItem={({ item }) => (
          <CategorySection onSelect={onSelect} category={item} catWidth={2.2} />
        )}
        ListEmptyComponent={() =>
          isLoading ? <WorkerSkeletonList /> : <Text>No workers found</Text>
        }
        contentContainerStyle={{
          padding: Sizes.sm,
        }}
        style={{ flex: 1, backgroundColor: Colors.white }}
      />
    </SafeAreaView>
  );
};

export default WorkersByCategory;
