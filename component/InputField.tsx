import { Colors } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';

type InputFieldProps = {
  label?: string;
  labelStyle?: TextStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputContainer?: ViewStyle;
  inputContainerStyles?: ViewStyle;
  secureTextEntry?: boolean;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  [key: string]: any;
};

const InputField = ({
  label,
  labelStyle,
  icon,
  iconStyle,
  inputStyle,
  inputContainer,
  inputContainerStyles,
  secureTextEntry,
  placeholder,
  multiline = false,
  numberOfLines = 4,
  ...props
}: InputFieldProps) => {
  const isPasswordField = secureTextEntry === true;
  const [showPassword, setShowPassword] = useState(
    isPasswordField ? false : true,
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, inputContainerStyles]}>
          {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

          <View
            style={[
              styles.inputWrapper,
              inputContainer,
              multiline && {
                minHeight: numberOfLines * 24,
                alignItems: 'flex-start',
              },
            ]}
          >
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color="#6B7280"
                style={{ marginBottom: 5 }}
              />
            )}

            <TextInput
              style={[
                styles.input,
                inputStyle,
                multiline && {
                  height: numberOfLines * 24,
                  textAlignVertical: 'top',
                },
              ]}
              secureTextEntry={isPasswordField ? !showPassword : false}
              placeholder={placeholder}
              placeholderTextColor="#6B7280"
              multiline={multiline}
              numberOfLines={numberOfLines}
              {...props}
            />

            {isPasswordField && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Image
                  source={
                    showPassword
                      ? require('../assets/icons/eye-hide.png')
                      : require('../assets/icons/eye.png')
                  }
                  resizeMode="contain"
                  style={styles.icon}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray800,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray600,
    borderRadius: 9999,
    paddingHorizontal: 20,
    position: 'relative',
    backgroundColor: Colors.white,
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'PoppinsRegular',
    color: Colors.black,
  },
});

export default InputField;
