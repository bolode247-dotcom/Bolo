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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type InputFieldProps = {
  label: string;
  labelStyle?: object;
  icon?: keyof typeof Ionicons.glyphMap;
  iconStyle?: object;
  inputStyle?: object;
  secureTextEntry?: boolean;
  placeholder?: string;
  [key: string]: any;
};

const InputField = ({
  label,
  labelStyle,
  icon,
  iconStyle,
  inputStyle,
  secureTextEntry,
  placeholder,
  ...props
}: InputFieldProps) => {
  const isPasswordField = label?.toLowerCase().includes('password');
  const [showPassword, setShowPassword] = useState(
    isPasswordField ? true : false,
  );
  return (
    <KeyboardAvoidingView
      // style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container]}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          <View style={styles.inputWrapper}>
            {icon && <Ionicons name={icon} size={24} color="#6B7280" />}
            <TextInput
              style={[styles.input, inputStyle]}
              secureTextEntry={isPasswordField ? !showPassword : false}
              placeholder={placeholder}
              placeholderTextColor="#6B7280"
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
    marginVertical: 8, // was my-2
  },
  label: {
    fontSize: 18, // text-lg
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray800,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray600, // neutral-100
    borderRadius: 9999, // rounded-full
    paddingHorizontal: 20,
    position: 'relative',
  },
  icon: {
    width: 25,
    height: 25,
    marginRight: 12, // ml-4
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'left',
    color: Colors.black,
  },
});

export default InputField;
