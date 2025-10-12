import { getChats } from '@/appwriteFuncs/appwriteGenFunc';
import ChatCard from '@/component/ChatCard';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chats = () => {
  const { user } = useAuth();

  const role = user?.role;

  const {
    data: chats,
    isLoading,
    refetch,
  } = useAppwrite(() => {
    if (!user || !role) return Promise.resolve([]);
    const userId =
      role === 'recruiter' ? user.recruiters?.$id : user.workers?.$id;
    return getChats(userId, role);
  });

  const handleOpenChat = (chat: any) => {
    router.push({
      pathname: '/messages',
      params: {
        chatId: chat.id,
        participantName: chat.participant?.name,
      },
    });
  };

  if (isLoading) return <JobWorkerSkeleton />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chats}
        refreshing={isLoading}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatCard chat={item} onPress={() => handleOpenChat(item)} />
        )}
        ListHeaderComponent={() => <Text style={styles.header}>Chats</Text>}
        ListEmptyComponent={() => <Text style={styles.empty}>No Chats</Text>}
      />
    </SafeAreaView>
  );
};

export default Chats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  header: {
    fontSize: 24,
    fontFamily: 'PoppinsBold',
    marginVertical: 12,
  },
  empty: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: Colors.gray900,
    marginVertical: 12,
    fontStyle: 'italic',
  },
});
