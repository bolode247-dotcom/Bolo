import { getChats } from '@/appwriteFuncs/appwriteGenFunc';
import ChatCard from '@/component/ChatCard';
import EmptyState from '@/component/EmptyState';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import SearchInput from '@/component/SearchInput';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { router, useFocusEffect } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chats = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [searchQuery, setSearchQuery] = React.useState('');

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

  useFocusEffect(() => {
    refetch();
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

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats || [];
    const q = searchQuery.trim().toLowerCase();
    return (chats || []).filter(
      (chat) =>
        chat.participant?.name?.toLowerCase().includes(q) ||
        chat.lastMessage?.toLowerCase().includes(q),
    );
  }, [searchQuery, chats]);

  if (isLoading) return <JobWorkerSkeleton />;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredChats}
        refreshing={isLoading}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatCard chat={item} onPress={() => handleOpenChat(item)} />
        )}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.header}>Chats</Text>
            <SearchInput
              placeholder="Search chat..."
              onSearch={setSearchQuery}
              isSearching={false}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon="chatbubbles-outline"
            title="No Chats"
            subtitle="You don’t have any active conversations yet."
          />
        )}
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
