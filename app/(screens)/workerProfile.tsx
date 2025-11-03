import {
  getWorkerById,
  getWorkSample,
} from '@/appwriteFuncs/appwriteWorkFuncs';
import CustomButton from '@/component/CustomButton';
import PostCard from '@/component/PostCard';
import ProfileSkeleton from '@/component/ProfileSkeleton';
import { Colors, Sizes } from '@/constants';
import useAppwrite from '@/lib/useAppwrite';
import { viewImage } from '@/Utils/helpers';
import { Ionicons, MaterialIcons, Octicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkerProfileScreen = () => {
  const { workerId, isRecruiter, reason } = useLocalSearchParams<{
    workerId: string;
    isRecruiter: string;
    reason: string;
  }>();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [postImageVisible, setPostImageVisible] = useState(false);
  const [postImage, setPostImage] = useState<string>('');
  const [postCaption, setPostCaption] = useState<string>('');

  const {
    data: worker,
    isLoading,
    error,
    refetch,
  } = useAppwrite(() => getWorkerById(workerId));

  const { data: post, isLoading: postLoading } = useAppwrite(() =>
    getWorkSample(workerId),
  );

  const otherSkill = worker?.workers?.otherSkill
    ? `${worker.workers.otherSkill}`
    : '';

  // ✅ Avatar placeholder
  const renderAvatar = () => {
    if (worker?.avatar) {
      return (
        <TouchableOpacity onPress={() => setImageModalVisible(true)}>
          <Image
            source={{ uri: viewImage(worker.avatar) }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      );
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
    if (post && post?.length > 0) {
      return (
        <FlatList
          data={post}
          keyExtractor={(item) => item.$id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              isRecruiter={true}
              cardStyles={styles.card}
              onImagePress={() => {
                setPostImage(item.image);
                setPostCaption(item.caption);
                setPostImageVisible(true);
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        />
      );
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
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            {renderAvatar()}
            <View style={styles.info}>
              <Text style={styles.name}>{worker?.name}</Text>
              <View>
                {worker?.isVerified ? (
                  <MaterialIcons
                    name="verified"
                    size={22}
                    color={Colors.primaryDark}
                  />
                ) : (
                  <Octicons
                    name="unverified"
                    size={22}
                    color={Colors.primaryDark}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <CustomButton
              title="Offer a Job"
              onPress={() =>
                router.push({
                  pathname: '/(screens)/create',
                  params: { workerId },
                })
              }
            />
          </View>
          {/* <View style={styles.statsRow}>
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
          </View> */}

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.address}>
              {worker?.locations?.region}, {worker?.locations?.division},{' '}
              {worker?.locations?.subdivision}
            </Text>

            {worker?.otherLocation && (
              <Text style={styles.address}>{worker?.otherLocation}</Text>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About {worker?.name}</Text>
            <Text style={styles.bio}>{worker?.workers?.bio}</Text>

            <View style={styles.metaCol}>
              <Text style={styles.meta}>Main Skill:</Text>
              <Text style={styles.sectionTitle}>{worker?.skills.name_en}</Text>
            </View>
            {otherSkill && (
              <View style={styles.metaCol}>
                <Text style={styles.meta}>Other skills:</Text>
                <Text style={styles.sectionTitle}>{otherSkill}</Text>
              </View>
            )}
          </View>
          {isRecruiter === 'true' && reason && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Why you should hire me</Text>
              <Text style={styles.bio}>{reason}</Text>
            </View>
          )}

          {/* Proof of Work (instead of "Why you should hire me") */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Samples</Text>
            <View style={styles.samplesRow}>{renderSamples()}</View>
          </View>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <SafeAreaView style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.modalCloseArea}
              onPress={() => setImageModalVisible(false)}
            />
            <View
              style={{
                width: '100%',
                height: '40%',
                overflow: 'hidden',
                aspectRatio: 2 / 2,
              }}
            >
              <Image
                source={{
                  uri: viewImage(worker?.avatar),
                }}
                style={styles.fullImage}
                resizeMode="cover"
              />
            </View>
          </SafeAreaView>
        </Modal>
        <Modal
          animationType="fade"
          transparent
          visible={postImageVisible}
          onRequestClose={() => setPostImageVisible(false)}
        >
          <SafeAreaView style={styles.modalBackground}>
            <TouchableOpacity
              style={styles.modalCloseArea}
              onPress={() => setPostImageVisible(false)}
            />
            <View
              style={{
                width: '100%',
                height: '40%',
                overflow: 'hidden',
                aspectRatio: 2 / 2,
              }}
            >
              <Image
                source={{
                  uri: viewImage(postImage),
                }}
                style={styles.fullImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.postCaption}>{postCaption}</Text>
          </SafeAreaView>
        </Modal>
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
  card: {
    width: 300,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullImage: { flex: 1, width: '100%', height: '100%', aspectRatio: 2 / 2 },
  postCaption: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    marginTop: Sizes.md,
    paddingHorizontal: Sizes.md,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
    justifyContent: 'center',
  },
});
