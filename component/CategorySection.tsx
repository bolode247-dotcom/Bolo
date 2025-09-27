import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Category = {
  id: string;
  name: string;
  icon: any;
  workers: number;
};

type Props = {
  category: Category;
  onSelect: (id: string) => void;
};

const screenWidth = Dimensions.get('window').width;
const categoryItemWidth = screenWidth / 2.5;

const CategorySection = ({ category, onSelect }: Props) => {
  return (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => onSelect(category.id)}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name={category.icon} size={50} color={Colors.gray700} />
      </View>
      <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">
        {category.name}
      </Text>
      <Text style={styles.categoryDetails}>{category.workers} Workers</Text>
    </TouchableOpacity>
  );
};

export default CategorySection;

const styles = StyleSheet.create({
  container: {
    marginVertical: Sizes.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Sizes.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: '500',
  },
  categoryItem: {
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    padding: Sizes.lg,
    borderRadius: Sizes.xsm,
    justifyContent: 'center',
    width: categoryItemWidth,
    height: 200,
  },
  iconWrapper: {
    borderRadius: Sizes.lg,
    padding: Sizes.sm,
    marginBottom: Sizes.xsm,
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'PoppinsSemiBold',
    flexWrap: 'wrap',
  },
  categoryDetails: {
    fontSize: 14,
    color: Colors.gray500,
    fontFamily: 'PoppinsSemiBold',
  },
});
