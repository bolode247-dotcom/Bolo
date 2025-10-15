import { Colors } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

type SearchInputProps = {
  placeholder?: string;
  initialQuery?: string;
  isSearching?: boolean;
  style?: any;
  onSearch?: (query: string) => void; // 👈 main addition
  debounceDelay?: number;
};

const SearchInput = ({
  placeholder = 'Search...',
  initialQuery = '',
  isSearching = false,
  style,
  onSearch,
  debounceDelay = 400,
}: SearchInputProps) => {
  const [query, setQuery] = useState(initialQuery || '');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch?.(query.trim());
    }, debounceDelay);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleManualSearch = () => {
    Keyboard.dismiss();
    onSearch?.(query.trim());
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
          onSubmitEditing={handleManualSearch}
        />

        {/* Loading or Submit */}
        <Pressable onPress={handleManualSearch} hitSlop={10}>
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

export default SearchInput;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    backgroundColor: Colors.gray100,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.black,
  },
});
