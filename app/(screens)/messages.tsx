import { getChatDetailsWithMessages } from '@/appwriteFuncs/appwriteGenFunc';
import EmptyState from '@/component/EmptyState';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { client, tables } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwriteConfig';
import useAppwrite from '@/lib/useAppwrite';
import { ChatDetails, Message } from '@/types/genTypes';
import { Feather } from '@expo/vector-icons';
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
  const { showToast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
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

          const payload = event.payload as { chats?: string };

          if (
            event.events.includes(
              'databases.*.collections.*.documents.*.create',
            ) &&
            payload.chats === chatId
          ) {
            const updated = await getChatDetailsWithMessages(chatId);
            if (isMounted) setChatDetails(updated);
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
  }, [chatDetails?.chat?.$id, user]);

  const { height } = useGradualAnimation();

  const fakeView = useAnimatedStyle(() => ({
    height: Math.max(0, Math.min(height.value, 300)),
    marginBottom: 0,
  }));

  const handleSendMessage = async () => {
    setIsSending(true);
    if (!newMessage.trim()) return;
    if (!user?.workers?.$id && !user?.recruiters?.$id) return;
    if (!chatDetails) return;

    const senderId = user?.workers?.$id || user?.recruiters?.$id;
    const isRecruiter = !!user?.recruiters?.$id;

    const messageData = {
      message: newMessage.trim(),
      senderId,
      chats: chatDetails.chat.$id,
    };

    try {
      // 1️⃣ Create the new message
      await tables.createRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.messagesCol,
        rowId: ID.unique(),
        data: messageData,
      });

      // 2️⃣ Prepare chat update
      const updateData: any = {
        lastMessage: newMessage.trim(),
        lastMessageAt: new Date().toISOString(),
      };

      // increment the unread count for the opposite party
      if (isRecruiter) {
        updateData.unreadBySeeker = (chatDetails.chat.unreadBySeeker ?? 0) + 1;
      } else {
        updateData.unreadByRecruiter =
          (chatDetails.chat.unreadByRecruiter ?? 0) + 1;
      }

      // 3️⃣ Update the chat
      await tables.updateRow({
        databaseId: appwriteConfig.dbId,
        tableId: appwriteConfig.chatsCol,
        rowId: chatDetails.chat.$id,
        data: updateData,
      });
      showToast('Message sent successfully', 'success', 3000);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      showToast(err.message, 'error', 3000);
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

  const groupedMessages = Object.entries(
    (chatDetails?.messages ?? []).reduce(
      (groups, message) => {
        const date = dayjs(message.$createdAt);
        let label = '';

        if (date.isToday()) label = 'Today';
        else if (date.isYesterday()) label = 'Yesterday';
        else label = date.format('DD/MM/YYYY');

        if (!groups[label]) groups[label] = [];
        groups[label].push(message);
        return groups;
      },
      {} as Record<string, Message[]>,
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
                      key={msg.$id}
                      style={[
                        styles.messageBubble,
                        isCurrentUser ? styles.myMessage : styles.otherMessage,
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          {
                            color: isCurrentUser ? Colors.white : Colors.text,
                          },
                        ]}
                      >
                        {msg.message}
                      </Text>

                      <Text
                        style={[
                          styles.messageTime,
                          { color: isCurrentUser ? '#dce6ff' : '#888' },
                        ]}
                      >
                        {dayjs(msg.$createdAt).format('HH:mm')}{' '}
                        {/* Always show time */}
                      </Text>
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
            estimatedItemSize={120} // slightly bigger to accommodate headers
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
    padding: 10,
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
    flexGrow: 1,
    flexShrink: 1,
    padding: 10,
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
