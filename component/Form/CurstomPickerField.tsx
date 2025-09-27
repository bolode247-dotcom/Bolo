import { Ionicons } from '@expo/vector-icons';
import { useFormikContext } from 'formik';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants';
import ErrorMessage from './ErrorMessage';

type DropDownFormFieldProps = {
  name?: string;
  label?: string;
  placeholder: string;
  openModal: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  data?: { id: string | number; label: string }[];
};

const CustomPickerField: React.FC<DropDownFormFieldProps> = ({
  label,
  name,
  placeholder,
  openModal,
  icon,
  data = [],
}) => {
  const { values, handleChange, errors, touched } = useFormikContext<any>();
  const selectedLabel =
    data.find((item) => item.id === values[name])?.label || '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color="#6B7280"
            style={styles.leftIcon}
          />
        )}

        <TouchableOpacity
          onPress={() => {
            handleChange(name);
            openModal();
          }}
          style={styles.touchable}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.input, values[name] ? {} : { color: '#6B7280' }]}
          >
            {selectedLabel || placeholder}
          </Text>

          <Ionicons name="chevron-down" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </KeyboardAvoidingView>
  );
};

export default CustomPickerField;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray800,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 9999,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    position: 'relative',
  },
  leftIcon: {
    marginRight: 12,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    textAlign: 'left',
    color: Colors.black,
  },
});
