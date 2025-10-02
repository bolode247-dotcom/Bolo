import { getLocations, getSkills } from '@/appwriteFuncs/appwriteGenFunc';
import { getWorkersByCategory } from '@/appwriteFuncs/appwriteWorkFuncs';
import CustomPickerSheet, { PickerItem } from '@/component/CustomPickerSheet';
import FilterBar, { FilterButton } from '@/component/FilterBar';
import RecommendedWorkerCard from '@/component/RecommendedCard';
import WorkerSkeletonList from '@/component/WorkerByCartSkeleton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkersByCategory = () => {
  const { user } = useAuth();

  const { categoryId: initialCategoryId } = useLocalSearchParams<{
    categoryId: string;
  }>();

  // State: active category (worker type)
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  // State: location filter
  const [selectedLocation, setSelectedLocation] =
    useState<PickerItem<string> | null>(null);

  // Data
  const { data: locations = [] } = useAppwrite(() => getLocations());
  const { data: skills = [] } = useAppwrite(() => getSkills());

  const fetchWorkers = useCallback(() => {
    return getWorkersByCategory({
      categoryId,
      locationId: selectedLocation?.id?.toString() || null,
    });
  }, [categoryId, selectedLocation]);

  const { data: workers = [], isLoading } = useAppwrite(fetchWorkers, [
    categoryId,
    selectedLocation,
  ]);

  // Bottom sheets
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [workerTypeSheetVisible, setWorkerTypeSheetVisible] = useState(false);

  // FilterBar buttons
  const filterButtons: FilterButton[] = [
    { id: 'sort', label: 'Sort by', type: 'text' },
    {
      id: 'location',
      label: selectedLocation?.label || 'Location',
      type: 'picker',
      onPress: () => setLocationSheetVisible(true),
    },
    {
      id: 'workerType',
      label: skills?.find((s) => s.id === categoryId)?.label || 'Worker Type',
      type: 'picker',
      onPress: () => setWorkerTypeSheetVisible(true),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      {/* FilterBar */}
      <View>
        <FilterBar buttons={filterButtons} />
      </View>

      {/* Worker List */}
      <FlatList
        data={workers}
        keyExtractor={(item) => item.$id}
        numColumns={user?.role === 'recruiter' ? 2 : 1}
        columnWrapperStyle={
          user?.role === 'recruiter'
            ? { justifyContent: 'space-between' }
            : undefined
        }
        renderItem={({ item }) => <RecommendedWorkerCard worker={item} />}
        ListEmptyComponent={() =>
          isLoading ? <WorkerSkeletonList /> : <Text>No workers found</Text>
        }
        contentContainerStyle={{
          padding: Sizes.sm,
        }}
        style={{ flex: 1, backgroundColor: Colors.white }}
      />

      <CustomPickerSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
        data={(locations || []).map((loc) => ({
          id: loc.id,
          label: loc.label,
        }))}
        onSelect={(item) => setSelectedLocation(item)}
        title="Select Location"
        showSearch
      />

      <CustomPickerSheet
        visible={workerTypeSheetVisible}
        onClose={() => setWorkerTypeSheetVisible(false)}
        data={(skills || []).map((s) => ({ id: s.id, label: s.label }))}
        onSelect={(item) => {
          setCategoryId(item.id.toString());
        }}
        title="Select Worker Type"
        showSearch
        initialSelectedId={categoryId}
      />
    </SafeAreaView>
  );
};

export default WorkersByCategory;
