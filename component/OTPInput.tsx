import React, { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Colors, Sizes } from '../constants';

interface OTPInputProps {
  value: string[];
  setValue: (val: string[]) => void;
  length?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, setValue, length = 6 }) => {
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (digit: string, index: number) => {
    if (digit.length > 1) return;
    const newOtp = [...value];
    newOtp[index] = digit;
    setValue(newOtp);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {value.map((digit, idx) => (
        <TextInput
          key={idx}
          ref={(ref) => (inputRefs.current[idx] = ref!)}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(txt) => handleChange(txt, idx)}
          onKeyPress={(e) => handleKeyPress(e, idx)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Sizes.xsm,
    marginVertical: Sizes.md,
  },
  input: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: Colors.gray300,
    borderRadius: Sizes.sm,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
});

export default OTPInput;
