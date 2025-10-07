import { getWorkerById } from '@/appwriteFuncs/appwriteWorkFuncs';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import useAppwrite from '@/lib/useAppwrite';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkerProfileScreen = () => {
  const { workerId } = useLocalSearchParams<{ workerId: string }>();

  const {
    data: worker,
    isLoading,
    error,
    refetch,
  } = useAppwrite(() => getWorkerById(workerId));

  const formatPayRate = (rate?: string) => {
    if (!rate) return { amount: 'N/A', label: 'Rate' };

    const [amount, unit] = rate.split('/');
    let label = 'Rate';

    if (unit === 'hr') label = 'Hourly Rate';
    if (unit === 'mo') label = 'Monthly Rate';
    if (unit === 'yr') label = 'Yearly Rate';
    if (unit === 'day') label = 'Daily Rate';

    return { amount, label };
  };

  const payRate = formatPayRate(worker?.workers?.payRate);

  // ✅ Avatar placeholder
  const renderAvatar = () => {
    if (worker?.avatar) {
      return <Image source={{ uri: worker.avatar }} style={styles.avatar} />;
    }
    return (
      <Ionicons
        name="person-circle-outline"
        size={100}
        color={Colors.gray400}
      />
    );
  };

  // ✅ Work samples
  const renderSamples = () => {
    if (worker?.resume?.length > 0) {
      return worker?.resume.map((img, index) => (
        <Image key={index} source={{ uri: img }} style={styles.sampleImg} />
      ));
    }

    // fallback placeholders
    return [1, 2, 3].map((i) => (
      <View key={i} style={[styles.sampleImg, styles.placeholder]}>
        <Ionicons name="image-outline" size={43} color={Colors.gray400} />
      </View>
    ));
  };

  if (isLoading) return <ProfileSkeleton />;
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerTitleAlign: 'center',
          headerRight: () => (
            <Ionicons
              name="heart-outline"
              size={28}
              color={Colors.text}
              style={{ marginRight: 16 }}
            />
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            {renderAvatar()}
            <Text style={styles.name}>{worker?.name}</Text>
            <Text style={styles.address}>
              {worker?.locations?.region}, {worker?.locations?.division},{' '}
              {worker?.locations?.subdivision}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue} numberOfLines={2}>
                {worker?.workers?.jobsCompleted}
              </Text>
              <Text style={styles.statLabel}>Jobs Complete</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {worker?.workers?.rating ?? '0.0'}{' '}
                <Ionicons name="star" size={14} color="gold" />
              </Text>
              <Text style={styles.statLabel}>Ratings</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{payRate.amount}</Text>
              <Text style={styles.statLabel}>{payRate.label}</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {worker?.name}</Text>
            <Text style={styles.bio}>{worker?.workers?.bio}</Text>

            <View style={styles.metaCol}>
              <Text style={styles.meta}>Expertise:</Text>
              <Text style={styles.sectionTitle}>{worker?.skills.name_en}</Text>
            </View>
          </View>

          {/* Proof of Work (instead of "Why you should hire me") */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Samples</Text>
            <View style={styles.samplesRow}>{renderSamples()}</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default WorkerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.md,
  },
  header: { alignItems: 'center', marginTop: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 20, fontFamily: 'PoppinsSemiBold', marginTop: 8 },
  address: { fontSize: 14, color: Colors.textLight },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: Sizes.sm,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    padding: Sizes.sm,
    borderRadius: Sizes.sm,
    justifyContent: 'center',
    gap: Sizes.x3sm,
    flex: 1,
  },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 12, color: Colors.textLight },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    marginBottom: 8,
  },
  bio: { fontSize: 14, color: Colors.gray700, fontFamily: 'PoppinsRegular' },
  metaCol: {
    flexDirection: 'row',
    gap: Sizes.sm,
    marginTop: 8,
  },
  meta: { fontSize: 15, color: Colors.gray700, fontFamily: 'PoppinsSemiBold' },
  metaData: { fontSize: 15, color: Colors.text },
  samplesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleImg: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  placeholder: {
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
