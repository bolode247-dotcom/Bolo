import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Sizes } from '../constants';

export type PickerItem<T> = {
  id: string | number;
  label: string;
  value?: T;
};

interface CustomPickerSheetProps<T> {
  visible: boolean;
  onClose: () => void;
  data: PickerItem<T>[];
  onSelect: (item: PickerItem<T>) => void;
  placeholder?: string;
  title?: string;
  showSearch?: boolean;
  initialSelectedId?: string | number;
  onSearch?: (query: string) => Promise<void>;
  loading?: boolean;
}

function CustomPickerSheet2<T>({
  visible,
  onClose,
  data,
  onSelect,
  placeholder = 'Search...',
  title,
  showSearch = false,
  initialSelectedId,
  onSearch,
  loading = false,
}: CustomPickerSheetProps<T>) {
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState<PickerItem<T>[]>(data);
  const [selectedId, setSelectedId] = useState<string | number | undefined>(
    initialSelectedId,
  );

  // Update filtered data when data changes
  useEffect(() => {
    if (!onSearch && showSearch) {
      setFilteredData(
        data.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        ),
      );
    } else {
      setFilteredData(data);
    }
  }, [query, data, onSearch, showSearch]);

  // Trigger remote search (debounced)
  useEffect(() => {
    if (onSearch && query.trim().length > 0) {
      const timeout = setTimeout(() => onSearch(query), 400);
      return () => clearTimeout(timeout);
    }
  }, [query, onSearch]);

  const handleSelect = (item: PickerItem<T>) => {
    setSelectedId(item.id);
    onSelect(item);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* <SafeAreaView style={styles.container} edges={['top', 'bottom']}> */}
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title || 'Select'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.gray600} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          {showSearch && (
            <View style={styles.searchWrapper}>
              <Ionicons
                name="search"
                size={20}
                color="#6B7280"
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={placeholder}
                style={styles.searchInput}
                placeholderTextColor="#6B7280"
              />
            </View>
          )}

          {/* List */}
          {loading ? (
            <ActivityIndicator
              size="small"
              color={Colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) =>
                item?.id ? String(item.id) : `key-${index}`
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    selectedId === item.id && styles.selectedItem,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.itemText,
                      selectedId === item.id && styles.selectedItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: 'center', marginTop: 10 }}>
                  No match found
                </Text>
              )}
              contentContainerStyle={[
                {
                  flexGrow: 1,
                  justifyContent: 'flex-start',
                  paddingBottom: 50,
                },
              ]}
            />
          )}
        </View>
      </View>
      {/* </SafeAreaView> */}
    </Modal>
  );
}

export default CustomPickerSheet2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: Colors.background,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: Sizes.md,
    height: '60%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: Sizes.md,
    fontWeight: '600',
    color: Colors.text,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Sizes.sm,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.md,
    color: Colors.text,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  selectedItem: {
    backgroundColor: Colors.gray200,
    borderRadius: 8,
  },
  itemText: {
    fontSize: Sizes.md,
    color: Colors.text,
  },
  selectedItemText: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
