import { getRecommendedWorkers } from '@/appwriteFuncs/appwriteWorkFuncs';
import RecommendedWorkerCard, {
  RecommendedCardProps,
} from '@/component/RecommendedCard';
import WorkerSkeletonList from '@/component/WorkerByCartSkeleton';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Recommended = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: workers, isLoading } = useAppwrite(() =>
    getRecommendedWorkers(
      user?.locations?.region,
      user?.skills?.$id,
      user?.skills.industry,
    ),
  );
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => {
          const workerProps: RecommendedCardProps = {
            users: {
              $id: item.id,
              name: item.name,
              avatar: null,
              skills: item.skill ? [item.skill] : [],
              locations: item.location ?? null,
              isVerified: item.isVerified ?? false,
              bio: item.bio ?? 'Hi, I am a dedicated worker.',
            },
            rating: item.rating ?? 0,
            avatar: item.avatar ?? '',
            location:
              item.location?.division ?? item.location?.region ?? 'Unknown',
          };
          return (
            <RecommendedWorkerCard
              worker={workerProps}
              onPress={() =>
                router.push({
                  pathname: '/(screens)/workerProfile',
                  params: { workerId: item.id },
                })
              }
            />
          );
        }}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() =>
          isLoading ? (
            <WorkerSkeletonList />
          ) : (
            <Text>{t('home.noWorkersFound')}</Text>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Recommended;

const styles = StyleSheet.create({
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
