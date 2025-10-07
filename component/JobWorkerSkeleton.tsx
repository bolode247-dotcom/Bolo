import { Colors, Sizes } from '@/constants';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

const JobWorkerSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Category Cards */}
      <FlatList
        data={[1, 2, 3]}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={() => (
          <View style={styles.card}>
            <Skeleton width={'100%'} height={25} radius={5} colorMode="light" />
            <Skeleton width={'50%'} height={20} radius={5} colorMode="light" />
            <Skeleton width={'100%'} height={25} radius={5} colorMode="light" />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: 16,
  },
  card: {
    backgroundColor: Colors.gray200,
    borderRadius: Sizes.sm,
    padding: Sizes.md,
    marginVertical: Sizes.xsm / 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    width: '100%',
    height: 125,
    gap: Sizes.sm,
  },
});

export default JobWorkerSkeleton;
