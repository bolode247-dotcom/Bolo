import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';

export type FilterButton = {
  id: string;
  label: string;
  type: 'text' | 'picker'; // text = static label, picker = opens bottom sheet
  onPress?: () => void;
};

interface FilterBarProps {
  buttons: FilterButton[];
}

const FilterBar = ({ buttons }: FilterBarProps) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={buttons}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.button}
          disabled={item.type === 'text'}
          onPress={item.onPress}
        >
          <Text style={styles.label}>{item.label}</Text>
          {item.type === 'picker' && (
            <Ionicons name="chevron-down" size={16} color="#374151" />
          )}
        </TouchableOpacity>
      )}
    />
  );
};

export default FilterBar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    height: Sizes.x6l,
    width: '100%',
    paddingVertical: 8,
    marginVertical: 8,
    // backgroundColor: Colors.background,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    height: Sizes.x4l,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
});
