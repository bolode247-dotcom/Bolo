import { Colors, Sizes } from '@/constants';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

const WorkerCardSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* Top Row: Avatar + Rating */}
      <View style={styles.headerRow}>
        <Skeleton width={50} height={50} radius="round" colorMode="light" />
        <Skeleton width={40} height={16} radius={4} colorMode="light" />
      </View>

      {/* Name */}
      <Skeleton width={'70%'} height={18} radius={4} colorMode="light" />

      {/* Role */}
      <Skeleton width={'50%'} height={14} radius={4} colorMode="light" />

      {/* Pay Rate */}
      <Skeleton width={'40%'} height={14} radius={4} colorMode="light" />

      {/* Location Row */}
      <View style={styles.locationRow}>
        <Skeleton width={16} height={16} radius="round" colorMode="light" />
        <Skeleton width={'60%'} height={12} radius={4} colorMode="light" />
      </View>
    </View>
  );
};

const WorkerSkeletonList = () => {
  return (
    <FlatList
      data={[1, 2, 3, 4]}
      numColumns={2}
      keyExtractor={(item) => item.toString()}
      renderItem={() => <WorkerCardSkeleton />}
      contentContainerStyle={styles.list}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: Sizes.sm,
  },
  card: {
    backgroundColor: Colors.gray50,
    borderRadius: Sizes.sm,
    padding: Sizes.sm,
    marginVertical: Sizes.xsm,
    width: '48%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
});

export default WorkerSkeletonList;
