import { Sizes } from '@/constants';
import Colors from '@/constants/Colors'; // Make sure your Colors object is imported
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface CustomButtonProps {
  onPress?: () => void;
  title: string;
  bgVariant?:
    | 'primary'
    | 'secondary'
    | 'secondary-outline'
    | 'outline'
    | 'danger'
    | 'danger-outline';
  textVariant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'secondary-outline'
    | 'danger'
    | 'danger-outline';
  IconLeft?: React.ElementType;
  IconRight?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  title,
  bgVariant = 'primary',
  textVariant = 'default',
  IconLeft,
  IconRight,
  style,
  textStyle,
  isLoading,
  ...props
}) => {
  // Background styles
  const getBgVariantStyle = () => {
    switch (bgVariant) {
      case 'primary':
        return { backgroundColor: Colors.primaryDark };
      case 'secondary':
        return { backgroundColor: Colors.secondaryDark };
      case 'secondary-outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.secondaryDark,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primaryDark,
        };
      case 'danger-outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.danger,
        };
      case 'danger':
        return { backgroundColor: Colors.danger };
      default:
        return { backgroundColor: Colors.primaryDark };
    }
  };

  // Text styles
  const getTextColor = () => {
    switch (textVariant) {
      case 'outline':
        return Colors.primaryDark;
      case 'secondary':
      case 'secondary-outline':
        return Colors.secondaryDark;
      case 'danger':
      case 'danger-outline':
        return Colors.danger;
      default:
        return Colors.white;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      style={({ pressed }) => [
        styles.button,
        getBgVariantStyle(),
        style,
        {
          opacity: isLoading ? 0.5 : pressed ? 0.8 : 1,
        },
      ]}
      {...props}
    >
      {IconLeft && (
        <IconLeft style={[styles.iconLeft, { color: getTextColor() }]} />
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={{ marginRight: Sizes.x2sm }}
          />
        )}

        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      </View>

      {IconRight && (
        <Ionicons name={IconRight} color={getTextColor()} size={24} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 9999, // rounded-full
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#999999',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 3, // for Android shadow
  },
  text: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    marginHorizontal: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default CustomButton;
