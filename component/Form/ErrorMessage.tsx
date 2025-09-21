import Sizes from '@/constants/Sizes';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '../../constants';

type ErrorMessageProps = {
  error?: string;
  visible?: boolean;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, visible }) => {
  if (!visible || !error) return null;
  return <Text style={styles.container}>{error}</Text>;
};

const styles = StyleSheet.create({
  container: {
    color: Colors.danger,
    paddingHorizontal: Sizes.lg,
    fontSize: Sizes.sm,
  },
});
export default ErrorMessage;
