import {
  getChatDetailsWithMessages,
  sendPushNotification,
} from '@/appwriteFuncs/appwriteGenFunc';
import EmptyState from '@/component/EmptyState';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { client, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import useAppwrite from '@/lib/useAppwrite';
import { ChatDetails, UIMsg } from '@/types/genTypes';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import dayjs from 'dayjs';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ID } from 'react-native-appwrite';
import {
  KeyboardProvider,
  useKeyboardHandler,
} from 'react-native-keyboard-controller';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const Messages = () => {
  return (
    <KeyboardProvider>
      <MessagesContent />
    </KeyboardProvider>
  );
};

const PADDING_BOTTOM = Platform.OS === 'ios' ? 20 : 0;

const useGradualAnimation = () => {
  const height = useSharedValue(PADDING_BOTTOM);

  useKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';
        // Clamp Android keyboard height to avoid extra nav-bar space
        const keyboardHeight =
          Platform.OS === 'android'
            ? Math.min(e.height, 300) // limit max keyboard height
            : e.height;

        height.value = Math.max(keyboardHeight, PADDING_BOTTOM);
      },
      onEnd: (e) => {
        'worklet';
        height.value = Math.max(e.height, PADDING_BOTTOM);
      },
    },
    [],
  );

  return { height };
};

const MessagesContent = () => {
  const { chatId, participantName } = useLocalSearchParams<{
    chatId: string;
    participantName: string;
  }>();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<UIMsg[]>([]);

  const { data, isLoading } = useAppwrite(() =>
    getChatDetailsWithMessages(chatId),
  );
  const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
  useEffect(() => {
    if (data) setChatDetails(data);
  }, [data]);

  const subscribed = useRef(false);
  useEffect(() => {
    if (!chatId || !client || !client.headers['x-appwrite-project']) return;
    if (subscribed.current) return;
    subscribed.current = true;

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const subscribe = async () => {
      try {
        const channel = `databases.${appwriteConfig.dbId}.collections.${appwriteConfig.messagesCol}.documents`;

        unsubscribe = await client.subscribe(channel, async (event) => {
          if (!isMounted) return;

          const payload = event.payload as any;

          if (
            event.events.includes(
              'databases.*.collections.*.documents.*.create',
            ) &&
            payload.chats === chatId
          ) {
            // 1. Remove matching optimistic message
            if (payload.clientMessageId) {
              setOptimisticMessages((prev) =>
                prev.filter(
                  (m) => m.clientMessageId !== payload.clientMessageId,
                ),
              );
            }

            // 2. Append real message
            setChatDetails((prev) => {
              if (!prev) return prev;

              return {
                ...prev,
                messages: [...prev.messages, payload],
              };
            });
          }
        });
      } catch (err) {
        console.warn('Realtime subscription failed:', err);
      }
    };

    subscribe();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [chatId]);

  useEffect(() => {
    if (!chatDetails || !user) return;

    const markAsRead = async () => {
      const isRecruiter = !!user?.recruiters?.$id;
      const updateData: any = {};

      if (isRecruiter && (chatDetails?.chat?.unreadByRecruiter ?? 0) > 0) {
        updateData.unreadByRecruiter = 0;
      } else if (!isRecruiter && (chatDetails?.chat?.unreadBySeeker ?? 0) > 0) {
        updateData.unreadBySeeker = 0;
      }

      if (Object.keys(updateData).length === 0) return; // nothing to update

      try {
        await tables.updateRow({
          databaseId: appwriteConfig.dbId,
          tableId: appwriteConfig.chatsCol,
          rowId: chatDetails.chat.$id,
          data: updateData,
        });
      } catch (err) {
        console.error('Error marking chat as read:', err);
      }
    };

    markAsRead();
  }, [chatDetails, user]);

  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(() => ({
    height: Math.max(0, Math.min(height.value, 300)),
    marginBottom: 0,
  }));

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!user?.workers?.$id && !user?.recruiters?.$id) return;
    if (!chatDetails) return;

    const trimmedMessage = newMessage.trim();
    const senderId = user.workers?.$id || user.recruiters?.$id;
    const isRecruiter = !!user.recruiters?.$id;
    const receiverId = chatDetails.chat.participants.find(
      (p: string) => p !== senderId,
    );

    if (!receiverId) {
      console.warn('❌ No receiver found in participants');
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const clientMessageId = tempId;

    const optimisticMsg: UIMsg = {
      id: tempId,
      clientMessageId,
      message: trimmedMessage,
      senderId,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage('');
    setIsSending(true);

    try {
      // 2️⃣ Create message in Appwrite
      await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.messagesCol,
        rowId: ID.unique(),
        data: {
          message: trimmedMessage,
          senderId,
          chats: chatDetails.chat.$id,
          clientMessageId,
        },
      });

      sendPushNotification({
        type: 'new_message',
        receiverId,
        message: `${trimmedMessage.slice(0, 50)}`,
      });

      // 3️⃣ Update chat metadata
      const updateData: any = {
        lastMessage: trimmedMessage,
        lastMessageAt: new Date().toISOString(),
      };

      if (isRecruiter) {
        updateData.unreadBySeeker = (chatDetails.chat.unreadBySeeker ?? 0) + 1;
      } else {
        updateData.unreadByRecruiter =
          (chatDetails.chat.unreadByRecruiter ?? 0) + 1;
      }

      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.chatsCol,
        rowId: chatDetails.chat.$id,
        data: updateData,
      });
    } catch (err) {
      console.error('Send failed:', err);

      // 5️⃣ Mark optimistic bubble as failed
      setOptimisticMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m)),
      );
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading && !chatDetails)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );

  const uiMessages: UIMsg[] = [
    ...(chatDetails?.messages ?? []).map((m) => ({
      id: m.$id,
      message: m.message,
      senderId: m.senderId,
      createdAt: m.$createdAt,
    })),
    ...optimisticMessages.map((m) => ({
      id: m.id,
      message: m.message,
      senderId: m.senderId,
      createdAt: m.createdAt,
      status: m.status,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const groupedMessages = Object.entries(
    uiMessages.reduce(
      (groups, message) => {
        const date = dayjs(message.createdAt);
        let label = '';

        if (date.isToday()) label = 'Today';
        else if (date.isYesterday()) label = 'Yesterday';
        else label = date.format('DD/MM/YYYY');

        if (!groups[label]) groups[label] = [];
        groups[label].push(message);
        return groups;
      },
      {} as Record<string, UIMsg[]>,
    ),
  );

  return (
    <KeyboardProvider>
      <Stack.Screen
        options={{ title: participantName ? participantName : 'Messages' }}
      />
      <SafeAreaView edges={['bottom']} style={styles.container}>
        <View style={{ flex: 1 }}>
          <LegendList
            data={groupedMessages}
            keyExtractor={([label]) => label}
            renderItem={({ item: [label, messages] }) => (
              <View key={label} style={{ marginVertical: 10 }}>
                {/* Header */}
                <Text style={styles.dateHeader}>{label}</Text>

                {/* Messages under this header */}
                {messages.map((msg) => {
                  const isCurrentUser =
                    msg.senderId === user?.workers?.$id ||
                    msg.senderId === user?.recruiters?.$id;

                  return (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageBubble,
                        isCurrentUser ? styles.myMessage : styles.otherMessage,
                        msg.status === 'failed' && { opacity: 0.6 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          { color: isCurrentUser ? Colors.white : Colors.text },
                        ]}
                      >
                        {msg.message}
                      </Text>
                      <View
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: 4,
                          },
                          styles.messageTimeContainer,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageTime,
                            { color: isCurrentUser ? '#dce6ff' : '#888' },
                          ]}
                        >
                          {dayjs(msg.createdAt).format('HH:mm')}
                          {msg.status === 'sending' && ' • Sending'}
                          {msg.status === 'failed' && ' • Failed'}
                        </Text>
                        {isCurrentUser && msg.status !== 'sending' && (
                          <MaterialCommunityIcons
                            name="check-all"
                            size={16}
                            color="#dce6ff"
                          />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            ListEmptyComponent={() => (
              <EmptyState
                title="No messages yet"
                subtitle="Start a conversation with the other party."
                icon="mail-sharp"
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            recycleItems
            initialScrollIndex={
              chatDetails?.messages?.length
                ? chatDetails.messages.length - 1
                : 0
            }
            alignItemsAtEnd
            maintainScrollAtEnd
            maintainVisibleContentPosition
            estimatedItemSize={120}
          />

          {/* Message input bar */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              style={styles.input}
              multiline
              placeholderTextColor={Colors.gray400}
              scrollEnabled={true}
            />
            <Pressable
              disabled={newMessage === ''}
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              {isSending ? (
                <ActivityIndicator color={Colors.primary} size={Sizes.sm} />
              ) : (
                <Feather
                  name="send"
                  size={22}
                  color={newMessage === '' ? Colors.gray700 : Colors.primary}
                />
              )}
            </Pressable>
          </View>
          <Animated.View style={fakeView} />
        </View>
      </SafeAreaView>
    </KeyboardProvider>
  );
};

export default Messages;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray200,
  },
  messageBubble: {
    maxWidth: '75%',

    paddingHorizontal: 10,
    marginVertical: 4,
    borderRadius: Sizes.sm,
  },
  myMessage: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  otherMessage: {
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
  },
  messageTimeContainer: {
    marginTop: 0,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.gray400,
    borderRadius: Sizes.xsm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 10,
  },
  input: {
    minHeight: 40,
    maxHeight: 120,
    flexGrow: 1,
    flexShrink: 1,
    padding: 10,
    textAlignVertical: 'top',
    color: Colors.text,
  },
  sendButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateHeader: {
    color: Colors.gray600,
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    marginBottom: 4,
    alignSelf: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: Sizes.x3sm,
  },
});
