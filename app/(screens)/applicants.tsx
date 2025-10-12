import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getApplicantsByJobId } from '@/appwriteFuncs/appwriteJobsFuncs';
import AppCard from '@/component/AppCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors, Sizes } from '@/constants';
import useAppwrite from '@/lib/useAppwrite';
import { SafeAreaView } from 'react-native-safe-area-context';

const Applicants = () => {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [activeTab, setActiveTab] = useState<'all' | 'selected'>('all');

  const fetchApplicants = useCallback(
    () => getApplicantsByJobId(jobId),
    [jobId],
  );
  const {
    data: applicants = [],
    isLoading,
    setData,
  } = useAppwrite(fetchApplicants);
  // 🔹 Calculate how many are "seen"
  const selectedCount = applicants?.filter((a) => a.status === 'seen').length;

  // 🔹 Filter for tab
  const filteredApplicants =
    activeTab === 'selected'
      ? applicants?.filter((item) => item.status === 'seen')
      : applicants;

  const handleStatusChange = (id: string, newStatus: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return prev.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app,
      );
    });
  };

  if (isLoading) return <JobWorkerSkeleton />;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Applicants',
          headerTitleAlign: 'center',
        }}
      />

      <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }}>
        {/* --- Tabs --- */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              All ({applicants?.length})
            </Text>
            {activeTab === 'all' && <View style={styles.activeUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setActiveTab('selected')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'selected' && styles.activeTabText,
              ]}
            >
              Selected ({selectedCount})
            </Text>
            {activeTab === 'selected' && (
              <View style={styles.activeUnderline} />
            )}
          </TouchableOpacity>
        </View>

        {/* --- Applicants List --- */}
        <FlatList
          data={filteredApplicants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AppCard
              app={item}
              jobId={jobId}
              onStatusChange={handleStatusChange}
              onPress={() =>
                router.push({
                  pathname: '/(screens)/workerProfile',
                  params: {
                    workerId: item.workerId,
                    isRecruiter: 'true',
                    reason: item.reason,
                  },
                })
              }
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() =>
            !isLoading && (
              <Text style={styles.emptyText}>
                No{' '}
                {activeTab === 'selected' ? 'applicant selected' : 'applicants'}{' '}
                yet.
              </Text>
            )
          }
        />
      </SafeAreaView>
    </>
  );
};

export default Applicants;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '50%',
  },
  tabText: {
    fontSize: Sizes.md,
    color: Colors.gray400,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  activeUnderline: {
    marginTop: 6,
    height: 3,
    width: '50%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.gray400,
    marginTop: 40,
  },
});
