import { Colors, Sizes } from '@/constants';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchInputField from './SearchField';

import { useNotifications } from '@/context/useNotification';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SearchInput from './SearchInput';

const ExploreHeader = ({
  title,
  search,
  initialQuery,
  isSearching,
  isRecruiter,
  onSearch,
}: {
  title: string;
  search: string;
  initialQuery?: string;
  isSearching?: boolean;
  isRecruiter?: boolean;
  onSearch?: (query: string) => void;
}) => {
  const notification = useNotifications();
  return (
    <ImageBackground
      source={require('@/assets/images/banner.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <View style={styles.overlayContent}>
        <View style={styles.notificationContainer}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity
            style={styles.notifyWrapper}
            onPress={() => {
              router.push('/(screens)/notifications');
            }}
          >
            <MaterialCommunityIcons
              name="bell-outline"
              size={25}
              color={Colors.white}
            />
            {notification > 0 && (
              <Text style={styles.notifyBadge}>
                {notification > 9 ? '9+' : notification}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        {onSearch ? (
          <SearchInput
            placeholder={search}
            isSearching={isSearching}
            onSearch={onSearch}
            style={styles.searchInput}
          />
        ) : (
          <SearchInputField
            placeholder={search}
            style={styles.searchInput}
            initialQuery={initialQuery}
            isSearching={isSearching}
            isRecruiter={isRecruiter}
          />
        )}
      </View>
    </ImageBackground>
  );
};

export default ExploreHeader;

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 180,
    // marginVertical: Sizes.md,
    justifyContent: 'center',
    overflow: 'hidden', // no peek
  },
  overlayContent: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: Sizes.md,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopLeftRadius: Sizes.md,
    borderTopRightRadius: Sizes.md,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    borderTopLeftRadius: Sizes.md,
    borderTopRightRadius: Sizes.md,
    resizeMode: 'cover',
  },
  searchInput: {
    width: '100%',
    marginTop: Sizes.md,
  },
  title: {
    color: Colors.white,
    fontSize: 25,
    fontFamily: 'PoppinsSemiBold',
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  notifyWrapper: {
    position: 'relative',
  },
  notifyBadge: {
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    right: 0,
    textAlign: 'center',
    width: Sizes.md,
    height: Sizes.md,
    borderRadius: Sizes.sm,
    fontSize: Sizes.xsm,
    color: '#fff',
    fontWeight: 'bold',
    lineHeight: Sizes.md,
  },
});
