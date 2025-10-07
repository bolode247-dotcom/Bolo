import { Colors, Sizes } from '@/constants';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import SearchInputField from './SearchField';

const ExploreHeader = ({
  title,
  search,
  onSearch,
  isSearching,
}: {
  title: string;
  search: string;
  onSearch?: (query: string) => void;
  isSearching?: boolean;
}) => {
  return (
    <ImageBackground
      source={require('@/assets/images/banner.png')}
      style={styles.banner}
      imageStyle={styles.bannerImage}
    >
      <View style={styles.overlayContent}>
        <Text style={styles.title}>{title}</Text>
        <SearchInputField
          placeholder={search}
          style={styles.searchInput}
          onSearch={onSearch}
          isSearching={isSearching}
        />
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
});
