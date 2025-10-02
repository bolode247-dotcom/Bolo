import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
// import ReactNativeModal from 'react-native-modal';
import Modal from 'react-native-modal';
import { Colors, Sizes } from '../constants';
import CustomButton from './CustomButton';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  iconName?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  primaryButtonTitle: string;
  onPrimaryPress: () => void;
  secondaryButtonTitle?: string;
  onSecondaryPress?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  iconName = 'check-circle',
  iconColor = Colors.primary,
  title,
  subtitle,
  primaryButtonTitle,
  onPrimaryPress,
  secondaryButtonTitle,
  onSecondaryPress,
}) => {
  if (!visible) return null;

  const deviceWidth = Dimensions.get('screen').width;
  const deviceHeight = Dimensions.get('screen').height;

  return (
    <Modal
      isVisible={visible}
      deviceWidth={deviceWidth}
      deviceHeight={deviceHeight}
    >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Ionicons name={iconName as any} size={48} color={iconColor} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Subtitle */}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        {primaryButtonTitle && onPrimaryPress && (
          <CustomButton
            title={primaryButtonTitle}
            style={styles.primaryBtn}
            onPress={() => {
              onPrimaryPress();
              onClose();
            }}
          />
        )}
        {secondaryButtonTitle && onSecondaryPress && (
          <CustomButton
            title={secondaryButtonTitle}
            style={styles.secondaryBtn}
            onPress={() => {
              onSecondaryPress();
              onClose();
            }}
            bgVariant="outline"
            textVariant="outline"
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: Sizes.lg,
    borderRadius: Sizes.md,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: Sizes.md,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.x2sm,
    borderRadius: 999,
  },
  title: {
    fontSize: Sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Sizes.sm,
    fontFamily: 'PoppinsSemiBold',
  },
  subtitle: {
    fontSize: Sizes.md,
    color: Colors.gray600,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  primaryBtn: {
    marginBottom: Sizes.sm,
  },
  secondaryBtn: {
    marginBottom: Sizes.sm,
  },
});

export default SuccessModal;
