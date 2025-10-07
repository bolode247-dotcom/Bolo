import { Sizes } from '@/constants';
import { Skeleton } from 'moti/skeleton';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const ProfileSkeleton = () => {
  const screenWidth = Dimensions.get('window').width;
  const statBoxWidth = (screenWidth - 64) / 3; // 3 stat boxes with margins

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={{ marginVertical: 16 }}>
          <Skeleton width={100} height={100} radius={50} colorMode="light" />
        </View>
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Skeleton width={160} height={20} radius={6} colorMode="light" />
          <Skeleton width={100} height={18} radius={6} colorMode="light" />
        </View>
      </View>

      {/* Stat Boxes */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statBox}>
            <Skeleton
              width={statBoxWidth * 0.9}
              height={70}
              radius={6}
              colorMode="light"
            />
          </View>
        ))}
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Skeleton width={120} height={20} radius={6} colorMode="light" />
        <Skeleton width={'100%'} height={200} radius={6} colorMode="light" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  profileHeader: { alignItems: 'center', marginTop: 16 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: Sizes.sm,
  },
  statBox: {
    flex: 1,
  },
  aboutSection: {
    marginTop: 16,
    gap: Sizes.xsm,
  },
});

export default ProfileSkeleton;
