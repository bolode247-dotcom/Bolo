import { getRecommendedWorkers } from '@/appwriteFuncs/appwriteWorkFuncs';
import RecommendedWorkerCard from '@/component/RecommendedCard';
import WorkerSkeletonList from '@/component/WorkerByCartSkeleton';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text } from 'react-native';

const Recommended = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: workers, isLoading } = useAppwrite(() =>
    getRecommendedWorkers(user?.locations?.$id, user?.skills),
  );
  return (
    <FlatList
      data={workers}
      keyExtractor={(item) => item.$id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <RecommendedWorkerCard worker={item} />}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={() =>
        isLoading ? (
          <WorkerSkeletonList />
        ) : (
          <Text>{t('home.noWorkersFound')}</Text>
        )
      }
    />
  );
};

export default Recommended;

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
