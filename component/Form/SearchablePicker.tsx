import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type PickerItem<T> = {
  id: string | number;
  label: string;
  value?: T;
};

interface SearchablePickerProps<T> {
  name?: string;
  label?: string;
  data: PickerItem<T>[];
  onSelect?: (item: PickerItem<T>) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  itemStyle?: ViewStyle;
  error?: string;
}

function SearchablePicker<T>({
  name,
  label,
  data,
  onSelect,
  placeholder = 'Search…',
  icon,
  containerStyle,
  labelStyle,
  inputStyle,
  itemStyle,
  error,
}: SearchablePickerProps<T>) {
  const formikContext = useFormikContext<Record<string, any>>();
  const formik = name ? formikContext : undefined;
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<PickerItem<T>[]>([]);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);

  // console.log('data', data);

  useEffect(() => {
    // If the search box is cleared
    if (!query.trim()) {
      setFiltered([]);
      setShowList(false);
      setLoading(false);
      return;
    }

    // Start loading when user types
    setLoading(true);

    // Simulate an API/network delay of 700ms
    const timeoutId = setTimeout(() => {
      const lower = query.toLowerCase();

      // Filter the data and limit results to 5
      const results = data
        .filter((item) => item.label.toLowerCase().includes(lower))
        .slice(0, 5);

      setFiltered(results);
      setShowList(true);
      setLoading(false);
    }, 700);

    // Cleanup to prevent race conditions when user types quickly
    return () => clearTimeout(timeoutId);
  }, [query, data]);

  const handleSelect = (item: PickerItem<T>) => {
    setQuery(item.label);
    setShowList(false);
    const idToStore = item.id;
    console.log('Selected item:', idToStore);
    if (name && formik?.setFieldValue) {
      formik.setFieldValue(name, idToStore);
    }
    if (onSelect) onSelect(item);
  };

  const formValue =
    name && formik?.values && name in formik.values ? formik.values[name] : '';
  useEffect(() => {
    // If Formik changes value externally, update query
    if (formValue && formValue !== query) {
      setQuery(formValue);
    }
  }, [formValue]);

  const displayError =
    error || (name && formik?.touched[name] && formik?.errors[name]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && (
          <Ionicons name={icon} size={24} color="#6B7280" style={styles.icon} />
        )}
        <TextInput
          value={query}
          onChangeText={setQuery}
          onBlur={() => name && formik?.setFieldTouched(name, true)}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          style={[styles.input, inputStyle]}
          onFocus={() => query && setShowList(true)}
        />
        {loading && <ActivityIndicator size="small" color="#6B7280" />}
      </View>

      {showList && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} // ✅ prevent nested scroll conflicts
          keyboardShouldPersistTaps="handled"
          style={styles.dropdown}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, itemStyle]}
              onPress={() => handleSelect(item)}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      {displayError ? (
        <Text style={styles.error}>{displayError as string}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8, width: '100%' },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray800,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 9999,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  icon: {
    marginRight: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.black,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginTop: 4,
    overflow: 'hidden',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  error: {
    color: Colors.danger,
    fontSize: Sizes.sm,
    marginTop: 4,
    paddingHorizontal: Sizes.lg,
  },
});

export default SearchablePicker;
