import { getWorkerFeed } from '@/appwriteFuncs/appwriteJobsFuncs';
import { getRecruiterFeed } from '@/appwriteFuncs/appwriteWorkFuncs';
import AppHeader from '@/component/AppHeader';
import BannerSection from '@/component/BannerSection';
import CategoryCard from '@/component/CategorySection';
import HomeSkeleton from '@/component/HomeSkeleton';
import JobCard from '@/component/JobCard';
import JobOfferCard from '@/component/OfferCard';
import RecommendedWorkerCard, {
  RecommendedCardProps,
} from '@/component/RecommendedCard';
import SearchInputField from '@/component/SearchField';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import {
  HomeFeedData,
  Job,
  Location,
  RecruiterFeedData,
  Skill,
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
  const fetchFunction = (): Promise<HomeFeedData> => {
    if (!user)
      return Promise.resolve({ offers: [], recommended: [], jobsByPlan: [] });

    if (user.role === 'recruiter') {
      return getRecruiterFeed(user);
    } else if (user?.workers?.$id) {
      return getWorkerFeed(user);
    } else {
      return Promise.resolve({ offers: [], recommended: [], jobsByPlan: [] });
    }
  };

  // --- Fetch data with Appwrite hook
  const { data, isLoading, error, refetch } =
    useAppwrite<HomeFeedData>(fetchFunction);

  // --- Navigation handler
  const onSelectCategory = (categoryId: string) => {
    router.push({ pathname: '/workerByCat', params: { categoryId } });
  };

  // --- Memoized List Header ---
  const renderHeader = useMemo(() => {
    if (!data) return null; // ✅ Prevent null access

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
            data={recruiterData?.mustHaveSkills || []}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <CategoryCard onSelect={onSelectCategory} category={item} />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          />
        );
      } else {
        const workerData = data as WorkerFeedData;
        const offers = workerData.offers.map((offer) => ({
          id: offer.id,
          job: offer.job,
        }));

        const jobsByPlanAsOffers = workerData.jobsByPlan.map((job) => ({
          id: job.job.id,
          job: job.job,
        }));

        const listData = offers.length > 0 ? offers : jobsByPlanAsOffers;

        return (
          <FlatList
            data={listData}
            horizontal
            keyExtractor={(item, index) =>
              item.id ?? item.job.id ?? index.toString()
            }
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

  type FeedItem =
    | {
        id: string;
        job: Job; // for job items
        type: 'job';
      }
    | {
        id: string;
        name: string;
        skill?: Skill | null;
        location?: Location | null;
        type: 'worker';
        bio: string;
        rating: number;
        avatar?: string | null;
        isVerified?: boolean;
      };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left']}>
      <AppHeader />

      <SearchInputField
        placeholder={t('home.searchPlaceholder')}
        style={styles.searchFieldStyles}
        isRecruiter={user?.role === 'recruiter' ? true : false}
      />

      {isLoading ? (
        <HomeSkeleton />
      ) : data ? (
        <>
          {(() => {
            const normalizedData: FeedItem[] = (() => {
              if (!data) return [];

              if (user?.role === 'recruiter' && 'recommendedWorkers' in data) {
                return data.recommendedWorkers.map((w) => ({
                  id: w.id,
                  name: w.name,
                  skill: w.skill,
                  location: w.location,
                  avatar: w.avatar,
                  isVerified: w.isVerified,
                  bio: w.bio,
                  rating: w.rating,
                  type: 'worker' as const,
                }));
              } else if ('offers' in data) {
                const offers = data.recommended.map((o) => ({
                  id: o.id,
                  job: o.job,
                  type: 'job' as const,
                }));
                const jobsByPlan = data.jobsByPlan.map((j) => ({
                  id: j.job.id,
                  job: j.job,
                  type: 'job' as const,
                }));
                return offers.length > 0 ? offers : jobsByPlan;
              }

              return [];
            })();

            return (
              <FlatList
                data={normalizedData}
                keyExtractor={(item) => item.id}
                numColumns={user?.role === 'recruiter' ? 2 : 1}
                ListHeaderComponent={data ? renderHeader : null}
                columnWrapperStyle={
                  user?.role === 'recruiter'
                    ? { justifyContent: 'space-between' }
                    : undefined
                }
                renderItem={({ item }) => {
                  if (item.type === 'worker') {
                    // ✅ Normalize FeedItem -> RecommendedCardProps
                    const workerProps: RecommendedCardProps = {
                      users: {
                        $id: item.id,
                        name: item.name,
                        avatar: null,
                        isVerified: item.isVerified ?? false,
                        skills: item.skill ? [item.skill] : [],
                        locations: item.location ?? null,
                      },
                      bio: item.bio ?? 'N/A',
                      rating: item.rating ?? 0,
                      avatar: item.avatar ?? '',
                      location:
                        item.location?.division ??
                        item.location?.region ??
                        'Unknown',
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
                  }

                  // ✅ Render job card normally
                  return (
                    <JobCard
                      job={item.job}
                      onPress={() =>
                        router.push({
                          pathname: '/jobDetails',
                          params: { jobId: item.job.id, isOffer: 'false' },
                        })
                      }
                    />
                  );
                }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  backgroundColor: Colors.background,
                }}
              />
            );
          })()}

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
      ) : null}
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
