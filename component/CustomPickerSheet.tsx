import { Ionicons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Sizes } from '../constants';

export type PickerItem<T> = {
  id: string;
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
}

function CustomPickerSheet<T>({
  visible,
  onClose,
  data,
  onSelect,
  placeholder = 'Search...',
  title,
  showSearch = false,
  initialSelectedId,
}: CustomPickerSheetProps<T>) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['90%', '100%'], []);
  const [query, setQuery] = useState('');
  const [filteredData, setFilteredData] = useState<PickerItem<T>[]>(data);
  const [selectedId, setSelectedId] = useState<string | number | undefined>(
    initialSelectedId,
  );

  // Control visibility
  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  // Filter data for search
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
    sheetRef.current?.dismiss(); // dismiss modal
    onClose(); // update parent state
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      handleIndicatorStyle={{ backgroundColor: Colors.gray300 }}
      backgroundStyle={{ backgroundColor: Colors.background }}
      enablePanDownToClose
      enableContentPanningGesture
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      onDismiss={onClose} // ensures parent state syncs
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title || 'Select'}</Text>
          <TouchableOpacity
            onPress={() => {
              sheetRef.current?.dismiss();
              onClose();
            }}
          >
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
        {/* <BottomSheetScrollView> */}
        {/* List */}
        <BottomSheetFlatList
          data={filteredData}
          keyExtractor={(item: PickerItem<T>) => item.id.toString()}
          nestedScrollEnabled={true} // ✅ important
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }: { item: PickerItem<T> }) => (
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
        {/* </BottomSheetScrollView> */}
      </View>
    </BottomSheetModal>
  );
}

export default CustomPickerSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
