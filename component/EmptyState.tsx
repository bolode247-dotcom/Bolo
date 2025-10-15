import { Colors, Sizes } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onPressButton?: () => void;
  style?: ViewStyle;
};

const EmptyState = ({
  icon = 'chatbubbles-outline',
  title,
  subtitle,
  buttonLabel,
  onPressButton,
  style,
}: EmptyStateProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={64} color={Colors.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {buttonLabel && onPressButton && (
        <TouchableOpacity style={styles.button} onPress={onPressButton}>
          <Text style={styles.buttonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.lg,
    marginTop: 80,
  },
  iconWrapper: {
    backgroundColor: Colors.gray100,
    borderRadius: 100,
    padding: 20,
    marginBottom: Sizes.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray600,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: '80%',
  },
  button: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: Sizes.sm,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});
