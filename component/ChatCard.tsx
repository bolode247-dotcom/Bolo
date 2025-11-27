import { Colors, Sizes } from '@/constants';
import { ChatPreview } from '@/types/genTypes';
import { formatTimestamp } from '@/Utils/Formatting';
import { viewImage } from '@/Utils/helpers';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  chat: ChatPreview;
  onPress?: () => void;
  onStatusChange?: (id: string, status: string) => void;
};

const pastelColors = [
  '#E0D7FF',
  '#D7F5E0',
  '#FFF3D7',
  '#FFD7E0',
  '#FDE7D7',
  '#D7F0FF',
  '#FFE0F0',
  '#E0FFF3',
  '#FFF0D7',
  '#D7FFE0',
  '#F0D7FF',
];

// Utility to get initials from a name
const getInitials = (name: string) => {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const ChatCard = ({ chat, onPress }: Props) => {
  const bgColor =
    pastelColors[Math.floor(Math.random() * pastelColors.length)] ||
    Colors.gray50;

  const initials = chat?.participant?.name
    ? getInitials(chat?.participant?.name)
    : '';
  return (
    <TouchableOpacity
      style={[styles.card, { width: '100%' }]}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <View style={styles.chatRow}>
          <View style={[styles.logoContainer, { backgroundColor: bgColor }]}>
            {chat?.participant?.avatar ? (
              <Image
                source={{ uri: viewImage(chat?.participant?.avatar) }}
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.logoText}>{initials}</Text>
            )}
          </View>
          <View>
            <Text
              style={styles.participantName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {chat?.participant?.name}
            </Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat?.lastMessage}
            </Text>
          </View>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.createdAt}>
            {formatTimestamp(chat?.lastMessageAt)}
          </Text>
          {chat?.unreadCount > 0 && (
            <Text style={styles.unreadCount}>{chat?.unreadCount}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray100,
    borderRadius: Sizes.sm,
    padding: Sizes.xsm,
    marginVertical: Sizes.xsm / 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
    marginRight: Sizes.sm,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: Sizes.sm,
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  logoText: {
    color: Colors.gray900,
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeRow: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Sizes.x3sm,
  },
  participantName: {
    fontSize: 15,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.text,
  },
  lastMessage: {
    fontSize: 12,
    color: Colors.gray800,
    fontFamily: 'PoppinsRegular',
    fontStyle: 'italic',
  },
  createdAt: {
    fontSize: 10,
    color: Colors.gray700,
  },
  unreadCount: {
    textAlign: 'center',
    width: Sizes.md,
    height: Sizes.md,
    borderRadius: Sizes.sm,
    fontSize: Sizes.xsm,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: Sizes.md,
    backgroundColor: Colors.primary,
  },
});
