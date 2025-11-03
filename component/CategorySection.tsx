import { Colors, Sizes } from '@/constants';
import { Skill } from '@/types/genTypes';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  catWidth?: number;
  category: Skill;
  onSelect: (id: string) => void;
};

const screenWidth = Dimensions.get('window').width;

const CategoryCard = ({ category, onSelect, catWidth = 2.5 }: Props) => {
  const { t } = useTranslation();
  const categoryItemWidth = screenWidth / catWidth;
  return (
    <TouchableOpacity
      style={[styles.categoryItem, { width: categoryItemWidth }]}
      onPress={() => onSelect(category.id)}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={category.icon || 'flash'}
          size={40}
          color={Colors.gray700}
        />
      </View>
      <Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">
        {category.name}
      </Text>
      <Text style={styles.categoryDetails}>
        {category.count ?? 0}{' '}
        {(category.count ?? 0) > 1 ? t('home.worker_plural') : t('home.worker')}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    // padding: Sizes.md,
    borderRadius: Sizes.xsm,
    justifyContent: 'center',
    height: 150,
  },
  iconWrapper: {
    borderRadius: 999,
    padding: Sizes.sm,
    marginBottom: Sizes.xsm,
    backgroundColor: Colors.white,
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
