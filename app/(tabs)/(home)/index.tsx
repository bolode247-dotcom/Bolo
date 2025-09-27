import {
  getTopSkillsAndWorkers,
  getWorkerJobs,
} from '@/appwriteFuncs/appwriteGenFunc';
import AppHeader from '@/component/AppHeader';
import BanerSection from '@/component/BanerSection';
import CategorySection from '@/component/CategorySection';
import RecommendedWorkerCard from '@/component/RecommendedCard';
import SearchInputField from '@/component/SearchField';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import React from 'react';
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

  const fetchFunction = () => {
    if (user?.role === 'recruiter') {
      return getTopSkillsAndWorkers(user?.locations?.$id, user?.skills);
    } else {
      return getWorkerJobs();
    }
  };

  const { data, isLoading, error, refetch } = useAppwrite(fetchFunction);

  const onSelect = () => {};

  const renderHeader = () => (
    <View style={styles.bgStyles}>
      <BanerSection />

      {user?.role === 'recruiter' ? (
        <>
          {/* Recruiter view: Skills Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
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
            <Text style={styles.sectionTitle}>Recommended Workers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Worker view: Job Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Job Offers</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data?.jobCategories || []}
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
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
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
        placeholder="Search for workers..."
        style={styles.searchFieldStyles}
      />
      <FlatList
        data={user?.role === 'recruiter' ? data?.topWorkers : data?.jobs}
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
});
