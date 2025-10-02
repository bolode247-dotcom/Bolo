import {
  getTopSkillsAndWorkers,
  getWorkerJobs,
} from '@/appwriteFuncs/appwriteGenFunc';
import AppHeader from '@/component/AppHeader';
import BannerSection from '@/component/BanerSection';
import CategorySection from '@/component/CategorySection';
import HomeSkeleton from '@/component/HomeSkeleton';
import RecommendedWorkerCard from '@/component/RecommendedCard';
import SearchInputField from '@/component/SearchField';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
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
  const [isFetching, setIsFetchgin] = useState(true);

  const fetchFunction = () => {
    if (user?.role === 'recruiter') {
      return getTopSkillsAndWorkers(user?.locations?.$id, user?.skills);
    } else {
      return getWorkerJobs();
    }
  };

  const { data, isLoading, error, refetch } = useAppwrite(fetchFunction);

  const onSelect = (categoryId: string) => {
    router.push({ pathname: '/workerByCat', params: { categoryId } });
  };

  const renderHeader = () => (
    <View style={styles.bgStyles}>
      <BannerSection />

      {user?.role === 'recruiter' ? (
        <>
          {/* Recruiter view: Skills Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.categories')}</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data?.topSkills || []}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => (
              <CategorySection onSelect={onSelect} category={item} />
            )}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.recommendedForYou')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/recombWorkers')}>
              <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Worker view: Job Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.jobOffers')}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data?.topSkills || []}
            horizontal
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => (
              <CategorySection onSelect={onSelect} category={item} />
            )}
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.recommendedForYou')}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

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
              user?.role === 'recruiter' ? data?.topWorkers : data?.topWorkers
            }
            ListHeaderComponent={renderHeader}
            numColumns={user?.role === 'recruiter' ? 2 : 1}
            columnWrapperStyle={
              user?.role === 'recruiter'
                ? { justifyContent: 'space-between' }
                : undefined
            }
            renderItem={({ item }) =>
              user?.role === 'recruiter' ? (
                <RecommendedWorkerCard worker={item} />
              ) : (
                <RecommendedWorkerCard job={item} />
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Sizes.md,
              backgroundColor: Colors.background,
            }}
          />

          {user?.role === 'recruiter' && (
            <View style={styles.fabContainer}>
              {/* Hint Badge */}
              <View style={styles.hintWrapper}>
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>{t('home.createJob')}</Text>
                </View>
                {/* Triangle pointer */}
                <View style={styles.triangle} />
              </View>

              {/* Floating Button */}
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
    backgroundColor: Colors.gray200,
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
    borderTopColor: Colors.primary, // same as badge background
    marginBottom: -1, // attach to badge
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
