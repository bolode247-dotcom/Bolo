import { Colors, Sizes } from '@/constants';
import useAppwrite from '@/lib/useAppwrite';
import { useLocalSearchParams } from 'expo-router';
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
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image source={{ uri: worker?.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{worker?.name}</Text>
          <Text style={styles.address}>{worker?.address}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker?.jobsCompleted}</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{worker?.rating}⭐</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${worker?.hourlyRate}</Text>
            <Text style={styles.statLabel}>Hourly rate</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About {worker?.name}</Text>
          <Text style={styles.bio}>{worker?.bio}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.meta}>Gender: {worker?.gender}</Text>
            <Text style={styles.meta}>Age: {worker?.age}</Text>
            <Text style={styles.meta}>Experience: {worker?.experience}</Text>
          </View>
          <Text style={styles.meta}>
            Expertise: {worker?.skills.join(', ')}
          </Text>
        </View>

        {/* Proof of Work (instead of "Why you should hire me") */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Samples</Text>
          <View style={styles.samplesRow}>
            {worker?.samples?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={styles.sampleImg}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkerProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Sizes.md,
  },
  header: { alignItems: 'center', marginVertical: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 20, fontFamily: 'PoppinsSemiBold', marginTop: 8 },
  address: { fontSize: 14, color: Colors.textLight },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: 'PoppinsSemiBold' },
  statLabel: { fontSize: 12, color: Colors.textLight },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    marginBottom: 8,
  },
  bio: { fontSize: 14, color: Colors.text },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  meta: { fontSize: 13, color: Colors.text },
  samplesRow: { flexDirection: 'row', gap: 10 },
  sampleImg: { width: 150, height: 100, borderRadius: 8 },
});
