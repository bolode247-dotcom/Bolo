import {
  getFilteredLocations,
  getFilteredSkills,
} from '@/appwriteFuncs/appwriteGenFunc';
import { getWorkersBySkillLocation } from '@/appwriteFuncs/appwriteWorkFuncs';
import { PickerItem } from '@/component/CustomPickerSheet';
import CustomPickerSheet2 from '@/component/CustomPickerSheet2';
import EmptyState from '@/component/EmptyState';
import FilterBar, { FilterButton } from '@/component/FilterBar';
import RecommendedWorkerCard, {
  RecommendedCardProps,
} from '@/component/RecommendedCard';
import WorkerSkeletonList from '@/component/WorkerByCartSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router, useLocalSearchParams } from 'expo-router';

import React, { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkersByCategory = () => {
  const { user } = useAuth();
  const { categoryId: initialCategoryId } = useLocalSearchParams<{
    categoryId: string;
  }>();

  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [selectedLocation, setSelectedLocation] = useState<PickerItem<
    string | number
  > | null>(null);

  // --- Lazy data states ---
  const [locations, setLocations] = useState<PickerItem<string>[]>([]);
  const [skills, setSkills] = useState<PickerItem<string>[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // --- Bottom sheets ---
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [workerTypeSheetVisible, setWorkerTypeSheetVisible] = useState(false);

  // --- Lazy fetch handlers ---
  const handleOpenLocationSheet = async () => {
    setLocationSheetVisible(true);
    if (locations.length === 0) {
      setLoadingLocations(true);
      const res = await getFilteredLocations('');
      setLocations(res.map((loc: any) => ({ id: loc.id, label: loc.label })));
      setLoadingLocations(false);
    }
  };

  const handleOpenWorkerTypeSheet = async () => {
    setWorkerTypeSheetVisible(true);
    if (skills.length === 0) {
      setLoadingSkills(true);
      const res = await getFilteredSkills('');
      setSkills(res.map((s: any) => ({ id: s.id, label: s.label })));
      setLoadingSkills(false);
    }
  };

  // --- Fetch workers ---
  const fetchWorkers = useCallback(
    () => getWorkersBySkillLocation(categoryId, selectedLocation?.id),
    [categoryId, selectedLocation],
  );
  const { data: workers = [], isLoading } = useAppwrite(fetchWorkers, [
    categoryId,
    selectedLocation,
  ]);

  // --- Filter buttons ---
  const filterButtons: FilterButton[] = [
    { id: 'sort', label: 'Filter By', type: 'text' },
    {
      id: 'location',
      label: selectedLocation?.label || 'Location',
      type: 'picker',
      onPress: handleOpenLocationSheet,
    },
    {
      id: 'workerType',
      label: skills.find((s) => s.id === categoryId)?.label || 'Worker Type',
      type: 'picker',
      onPress: handleOpenWorkerTypeSheet,
    },
  ];

  // --- Search handlers (for large datasets) ---
  const handleSearchLocation = async (text: string) => {
    setLoadingLocations(true);
    const res = await getFilteredLocations(text);
    setLocations(res.map((loc: any) => ({ id: loc.id, label: loc.label })));
    setLoadingLocations(false);
  };

  const handleSearchSkill = async (text: string) => {
    setLoadingSkills(true);
    const res = await getFilteredSkills(text);
    setSkills(res.map((s: any) => ({ id: s.id, label: s.label })));
    setLoadingSkills(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <View>
        <FilterBar buttons={filterButtons} />
      </View>

      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        numColumns={user?.role === 'recruiter' ? 2 : 1}
        columnWrapperStyle={
          user?.role === 'recruiter'
            ? { justifyContent: 'space-between' }
            : undefined
        }
        renderItem={({ item }) => {
          const workerProps: RecommendedCardProps = {
            users: {
              $id: item.id,
              name: item.name,
              avatar: null,
              skills: item.skill ? [item.skill] : [],
              locations: item.location ?? null,
              isVerified: item.isVerified ?? false,
              bio: item.bio ?? `Hi, I'm ${item.name}`,
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
        ListEmptyComponent={() =>
          isLoading ? (
            <WorkerSkeletonList />
          ) : (
            <EmptyState
              title="No worker found"
              icon="search"
              subtitle="Oops! No worker found in this category"
            />
          )
        }
        contentContainerStyle={{ padding: Sizes.sm }}
        style={{ flex: 1, backgroundColor: Colors.white }}
      />

      <CustomPickerSheet2
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
        data={locations}
        onSelect={(item) =>
          setSelectedLocation({ ...item, id: String(item.id) })
        }
        title="Select Location"
        showSearch
        onSearch={handleSearchLocation} // 👈 triggers backend search
        loading={loadingLocations}
      />

      <CustomPickerSheet2
        visible={workerTypeSheetVisible}
        onClose={() => setWorkerTypeSheetVisible(false)}
        data={skills}
        onSelect={(item) => setCategoryId(String(item.id))}
        title="Select Worker Type"
        showSearch
        onSearch={handleSearchSkill}
        loading={loadingSkills}
      />
    </SafeAreaView>
  );
};

export default WorkersByCategory;
