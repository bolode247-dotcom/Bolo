import { Colors } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

type SearchInputFieldProps = {
  placeholder?: string;
  initialQuery?: string;
  isSearching?: boolean;
  style?: ViewStyle;
  onSearch?: (query: string) => void;
};

const SearchInputField = ({
  placeholder = 'Search...',
  initialQuery = '',
  isSearching = false,
  style,
  onSearch,
}: SearchInputFieldProps) => {
  const pathName = usePathname();
  const [query, setQuery] = useState(initialQuery || '');

  const handleSearch = () => {
    if (!query) return;

    if (pathName.startsWith('/search')) {
      router.setParams({ query });
    } else {
      router.push(`/search/${query}`);
    }

    setTimeout(() => Keyboard.dismiss(), 50);
  };

  const delayedSearch = () => {
    requestAnimationFrame(() => {
      handleSearch();
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.inputWrapper, style]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray400}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          blurOnSubmit={false}
        />

        {/* Loading or Submit */}
        <Pressable onPress={delayedSearch} hitSlop={10}>
          {isSearching ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="search-circle" size={40} color={Colors.primary} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SearchInputField;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999, // rounded-full look
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.black,
  },
});
