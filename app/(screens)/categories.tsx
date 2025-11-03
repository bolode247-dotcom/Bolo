import { getTopSkills } from '@/appwriteFuncs/appwriteWorkFuncs';
import CategoryCard from '@/component/CategorySection';
import EmptyState from '@/component/EmptyState';
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
        data={workers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <CategoryCard onSelect={onSelect} category={item} catWidth={2.2} />
        )}
        ItemSeparatorComponent={() => (
          <Text style={{ marginBottom: Sizes.x3sm }} />
        )}
        ListEmptyComponent={() =>
          isLoading ? (
            <WorkerSkeletonList />
          ) : (
            <EmptyState
              icon="person-remove"
              title="No Workers"
              subtitle="No workers found at the moment"
            />
          )
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
