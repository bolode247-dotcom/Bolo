import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';

const HomeSkeleton = () => {
  const screenWidth = Dimensions.get('window').width;
  const categoryItemWidth = screenWidth / 2.5;
  return (
    <View style={styles.container}>
      {/* Banner */}
      <Skeleton width={'100%'} height={180} radius={12} colorMode="light" />

      {/* Section Title (Category) */}
      <View style={styles.sectionHeader}>
        <Skeleton width={120} height={20} radius={4} colorMode="light" />
        <Skeleton width={60} height={20} radius={4} colorMode="light" />
      </View>

      {/* Category Cards */}
      <FlatList
        data={[1, 2, 3]}
        horizontal
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.categoryList}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={() => (
          <Skeleton
            width={categoryItemWidth}
            height={150}
            radius={12}
            colorMode="light"
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    alignItems: 'center',
  },
  categoryList: {
    paddingVertical: 8,
  },
});

export default HomeSkeleton;
