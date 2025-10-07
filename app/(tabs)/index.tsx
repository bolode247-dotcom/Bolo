import { getTopSkillsAndWorkers } from '@/appwriteFuncs/appwriteGenFunc';
import { getWorkerFeed } from '@/appwriteFuncs/appwriteJobsFuncs';
import AppHeader from '@/component/AppHeader';
import BannerSection from '@/component/BanerSection';
import CategorySection from '@/component/CategorySection';
import HomeSkeleton from '@/component/HomeSkeleton';
import JobCard from '@/component/JobCard';
import JobOfferCard from '@/component/OfferCard';
import RecommendedWorkerCard from '@/component/RecommendedCard';
import SearchInputField from '@/component/SearchField';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import {
  HomeFeedData,
  RecruiterFeedData,
  WorkerFeedData,
} from '@/types/genTypes';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // --- Fetch function
  const fetchFunction = () => {
    if (!user) return Promise.resolve([]);
    if (user.role === 'recruiter') {
      return getTopSkillsAndWorkers(user?.locations?.$id, user?.skills);
    } else if (user?.workers?.$id) {
      return getWorkerFeed(user);
    } else {
      return Promise.resolve([]);
    }
  };

  // --- Fetch data with Appwrite hook
  const { data, isLoading, error, refetch } =
    useAppwrite<HomeFeedData>(fetchFunction);

  // --- Navigation handler
  const onSelectCategory = (categoryId: string) => {
    router.push({ pathname: '/workerByCat', params: { categoryId } });
  };

  // --- Memoized header for performance
  const renderHeader = useMemo(() => {
    if (!data) return null;

    const isRecruiter = user?.role === 'recruiter';

    const renderSectionHeader = (title: string, onPress?: () => void) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    const renderCategoryList = () => {
      if (!data) return null;
      if (isRecruiter) {
        const recruiterData = data as RecruiterFeedData;
        return (
          <FlatList
            data={recruiterData?.topSkills || []}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <CategorySection onSelect={onSelectCategory} category={item} />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          />
        );
      } else {
        const workerData = data as WorkerFeedData;
        return (
          <FlatList
            data={
              workerData.offers.length > 0
                ? workerData.offers
                : workerData.jobsByPlan || []
            }
            horizontal
            keyExtractor={(item) => item?.job?.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <JobOfferCard
                job={item.job}
                onPress={() =>
                  router.push({
                    pathname: '/jobDetails',
                    params: {
                      jobId: item.job.id,
                      isOffer: workerData.offers.length > 0 ? 'true' : 'false',
                    },
                  })
                }
              />
            )}
          />
        );
      }
    };

    return (
      <View style={styles.bgStyles}>
        <BannerSection />

        {/* Categories / Job Offers Section */}
        {renderSectionHeader(
          isRecruiter ? t('home.categories') : t('home.jobOffers'),
          isRecruiter ? () => router.push('/categories') : undefined,
        )}
        {renderCategoryList()}

        {/* Recommended Section */}
        {renderSectionHeader(
          t('home.recommendedForYou'),
          isRecruiter ? () => router.push('/recombWorkers') : undefined,
        )}
      </View>
    );
  }, [data, user, t]);

  // --- Main render
  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <AppHeader />
      <SearchInputField
        placeholder={t('home.searchPlaceholder')}
        style={styles.searchFieldStyles}
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : (
        <>
          <FlatList
            data={
              user?.role === 'recruiter'
                ? data?.topWorkers || []
                : data?.recommended || []
            }
            ListHeaderComponent={renderHeader}
            numColumns={user?.role === 'recruiter' ? 2 : 1}
            columnWrapperStyle={
              user?.role === 'recruiter'
                ? { justifyContent: 'space-between' }
                : undefined
            }
            keyExtractor={(item) =>
              item.job.id || item.users?.$id || Math.random().toString()
            }
            renderItem={({ item }) =>
              user?.role === 'recruiter' ? (
                <RecommendedWorkerCard
                  worker={item}
                  onPress={() =>
                    router.push({
                      pathname: '/(screens)/workerProfile',
                      params: { workerId: item.users?.$id },
                    })
                  }
                />
              ) : (
                <JobCard
                  job={item.job}
                  onPress={() => {
                    router.push({
                      pathname: '/jobDetails',
                      params: { jobId: item?.job?.id, isOffer: 'false' },
                    });
                  }}
                />
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Sizes.md,
              backgroundColor: Colors.background,
            }}
          />

          {/* Floating Action Button for Recruiters */}
          {user?.role === 'recruiter' && (
            <View style={styles.fabContainer}>
              <View style={styles.hintWrapper}>
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>{t('home.createJob')}</Text>
                </View>
                <View style={styles.triangle} />
              </View>
              <TouchableOpacity
                style={styles.fabButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(screens)/create')}
              >
                <AntDesign name="plus-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray100,
    flex: 1,
  },
  bgStyles: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  searchFieldStyles: {
    width: '93%',
    marginHorizontal: 'auto',
    marginVertical: Sizes.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'PoppinsSemiBold',
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'PoppinsSemiBold',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
  },
  hintWrapper: {
    alignItems: 'center', // center triangle under badge
    marginBottom: 8,
  },
  hintContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  hintText: {
    fontSize: 10,
    color: Colors.white,
    fontFamily: 'PoppinsMedium',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8, // ✅ inverted
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginBottom: -1,
  },
  fabButton: {
    backgroundColor: 'green',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5,
  },
});
