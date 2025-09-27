import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
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

interface CustomPickerModalProps<T> {
  visible: boolean;
  onClose: () => void;
  data: PickerItem<T>[];
  onSelect: (item: PickerItem<T>) => void;
  placeholder?: string; // only for search input
  title?: string;
  showSearch?: boolean;
  initialSelectedId?: string | number;
  modalHeight?: number; // optional custom height
}

function CustomPickerModal<T>({
  visible,
  onClose,
  data,
  onSelect,
  placeholder = 'Search...',
  title,
  showSearch = false,
  initialSelectedId,
  modalHeight,
}: CustomPickerModalProps<T>) {
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState<PickerItem<T>[]>(data);
  const [selectedId, setSelectedId] = useState<string | number | undefined>(
    initialSelectedId,
  );

  useEffect(() => {
    if (!data) {
      setFilteredData([]);
      return;
    }

    setFilteredData(
      showSearch
        ? data.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          )
        : data,
    );
  }, [query, data, showSearch]);

  const handleSelect = (item: PickerItem<T>) => {
    setSelectedId(item.id);
    onSelect(item);
    onClose();
  };

  const maxHeight = modalHeight || Dimensions.get('window').height * 0.6;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { maxHeight }]}>
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
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            style={{ flexGrow: 0 }}
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
            ListEmptyComponent={() => <Text>No match found</Text>}
          />
        </View>
      </View>
    </Modal>
  );
}

export default CustomPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: Sizes.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
    borderColor: Colors.gray600,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.md,
    color: Colors.text,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.gray300,
  },
  selectedItem: {
    backgroundColor: Colors.gray200,
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
