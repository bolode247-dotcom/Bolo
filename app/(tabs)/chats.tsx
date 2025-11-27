import { getChats } from '@/appwriteFuncs/appwriteGenFunc';
import ChatCard from '@/component/ChatCard';
import EmptyState from '@/component/EmptyState';
import JobWorkerSkeleton from '@/component/JobWorkerSkeleton';
import SearchInput from '@/component/SearchInput';
import { Colors } from '@/constants';
import { useAuth } from '@/context/authContex';
import { client } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import useAppwrite from '@/lib/useAppwrite';
import { ChatPreview } from '@/types/genTypes';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chats = () => {
  const { user } = useAuth();
  const role = user?.role;
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchChats = React.useCallback(() => {
    if (!user || !role) return Promise.resolve([]);
    const userId =
      role === 'recruiter' ? user.recruiters?.$id : user.workers?.$id;
    return getChats(userId, role);
  }, [user, role]);

  const { data: chats, isLoading, refetch } = useAppwrite(fetchChats);

  const [realtimeChats, setRealtimeChats] = React.useState<
    ChatPreview[] | null
  >(null);

  const mergedChats = realtimeChats || chats; // use realtime updates if available

  React.useEffect(() => {
    if (!user?.$id) return;

    let unsubscribe = () => {};

    try {
      unsubscribe = client.subscribe(
        `databases.${appwriteConfig.dbId}.collections.${appwriteConfig.chatsCol}.documents`,
        async (event) => {
          try {
            const shouldUpdate = event.events.some(
              (e) => e.includes('.update') || e.includes('.create'),
            );

            if (shouldUpdate) {
              const userId =
                role === 'recruiter' ? user.recruiters?.$id : user.workers?.$id;
              const updated = await getChats(userId, role);
              setRealtimeChats(updated); // only updates realtime state, avoids isLoading
            }
          } catch (innerErr) {
            console.error('⚠️ Error inside realtime event callback:', innerErr);
          }
        },
      );
    } catch (err) {
      console.error('❌ Failed to initialize realtime subscription:', err);
    }

    return () => {
      try {
        unsubscribe();
      } catch (cleanupErr) {
        console.error('⚠️ Error during realtime cleanup:', cleanupErr);
      }
    };
  }, [user?.$id]);

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
    if (!searchQuery.trim()) return mergedChats || [];
    const q = searchQuery.trim().toLowerCase();
    return (mergedChats || []).filter(
      (chat) =>
        chat.participant?.name?.toLowerCase().includes(q) ||
        chat.lastMessage?.toLowerCase().includes(q),
    );
  }, [searchQuery, mergedChats]);

  const listHeader = useMemo(
    () => (
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.header}>Chats</Text>
        <SearchInput
          placeholder="Search chat..."
          onSearch={setSearchQuery}
          isSearching={false}
        />
      </View>
    ),
    [],
  );

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
        ListHeaderComponent={listHeader}
        ListEmptyComponent={() => (
          <EmptyState
            icon="chatbubbles-outline"
            title="No Chats"
            subtitle="You don’t have any active conversations yet."
          />
        )}
        keyboardShouldPersistTaps="handled"
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
