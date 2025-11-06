import { Colors, Sizes } from '@/constants';
import {
  formatTimestamp,
  getInitials,
  getRandomPastelColor,
} from '@/Utils/Formatting';
import { viewImage } from '@/Utils/helpers';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type Worker = {
  name?: string;
  avatar?: string | null;
  isVerified?: boolean;
};
type Post = {
  caption: string;
  image: string;
  createdAt: string;
  id: string;
  worker?: Worker;
};

type Props = {
  post: Post;
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onImagePress?: () => void;
  isRecruiter?: boolean;
  showAvatar?: boolean;
  cardStyles?: ViewStyle;
  onAvatarPress?: () => void;
};

const PostCard: React.FC<Props> = ({
  post,
  isDeleting,
  onEdit,
  onDelete,
  isRecruiter,
  cardStyles,
  onImagePress,
  showAvatar = false,
  onAvatarPress,
}) => {
  const [showFull, setShowFull] = useState(false);

  const MAX_LENGTH = 80;
  const isLong = post.caption.length > MAX_LENGTH;
  const displayedText = showFull
    ? post.caption
    : isLong
      ? post.caption.slice(0, MAX_LENGTH) + '...'
      : post.caption;

  return (
    <View style={[styles.card, cardStyles]}>
      {showAvatar && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onAvatarPress}
          style={styles.headerRow}
        >
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: getRandomPastelColor() },
            ]}
          >
            {post.worker?.avatar ? (
              <Image
                source={{ uri: viewImage(post.worker?.avatar) }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.logoText}>
                {getInitials(post.worker?.name)}
              </Text>
            )}
          </View>
          <View style={styles.nameRow}>
            <Text
              style={styles.workerName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {post.worker?.name}
            </Text>

            {post.worker?.isVerified && (
              <MaterialIcons
                name="verified"
                size={18}
                color={Colors.primaryDark}
                style={styles.verifiedIcon}
              />
            )}
          </View>
        </TouchableOpacity>
      )}
      {/* Caption Section */}
      <View
        style={[
          styles.captionContainer,
          showFull ? { marginBottom: Sizes.x2sm } : { marginBottom: 4 },
        ]}
      >
        <Text style={styles.captionText} onPress={() => setShowFull(!showFull)}>
          {displayedText}
          {isLong && (
            <Text style={styles.seeMoreText}>
              {showFull ? ' ...see less' : ' see more'}
            </Text>
          )}
        </Text>
      </View>

      {/* Thumbnail Image */}
      <TouchableOpacity activeOpacity={0.9} onPress={onImagePress}>
        <Image source={{ uri: viewImage(post.image) }} style={styles.image} />
      </TouchableOpacity>

      {/* Action Buttons */}
      {!isRecruiter && (
        <View style={styles.buttonRow}>
          <Text style={styles.dateText}>{formatTimestamp(post.createdAt)}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Feather name="trash-2" size={16} color="#fff" />
              {isDeleting ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginLeft: 5 }}
                />
              ) : (
                <Text style={styles.buttonText}>Delete</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEdit}
            >
              <Feather name="edit-2" size={16} color="#fff" />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    marginVertical: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: Sizes.x3sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },

  workerName: {
    flexShrink: 1, // allow text to truncate
    fontSize: Sizes.md,
    fontFamily: 'PoppinsBold',
    color: Colors.gray900,
    marginRight: 4,
  },

  verifiedIcon: {
    flexShrink: 0,
    marginBottom: 3,
  },
  logoText: {
    color: Colors.gray900,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  captionContainer: {
    alignSelf: 'flex-start',
  },
  captionText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.gray800,
    lineHeight: 19,
    marginBottom: 0,
    paddingBottom: 0,
  },
  seeMoreText: {
    color: '#3B82F6', // blue
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
  },
  dateText: {
    fontSize: 12,
    color: Colors.gray600,
  },
});
