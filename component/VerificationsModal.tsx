import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import * as Yup from 'yup';
import { Colors, Sizes } from '../constants';
import AppForm from './Form/AppForm';
import FormikOTPField from './Form/FormikFormField';
import SubmitButton from './Form/SubmitButton';

export const validationSchema = Yup.object().shape({
  otpCode: Yup.string()
    .required('OTP is required')
    .min(6, 'Must be 6 digits')
    .max(6, 'Must be 6 digits')
    .label('OTP'),
});

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: { otpCode: string }) => void | Promise<void>;
  onResend: () => void;
  isLoading: boolean;
  email?: string;
  errorMessage?: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  onResend,
  isLoading,
  email,
  errorMessage,
}) => {
  const { t } = useTranslation();
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));

  useEffect(() => {
    if (visible) {
      setTimer(30);
      setIsResendDisabled(true);
      setOtp(Array(6).fill(''));
    }
  }, [visible]);

  useEffect(() => {
    if (timer > 0 && visible) {
      const countdown = setTimeout(() => setTimer((t) => t - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer, visible]);

  if (!visible) return null;

  return (
    <ReactNativeModal isVisible={visible} onBackdropPress={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('verification.title')}</Text>
        <Text style={styles.subtitle}>
          {t('verification.subtitle', { email })}
        </Text>
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        <AppForm
          initialValues={{ otpCode: '' }}
          validationSchema={validationSchema}
          onSubmit={(values) => onSubmit({ otpCode: values.otpCode })}
        >
          <FormikOTPField name="otpCode" length={6} />

          <SubmitButton
            title={t('verification.submit')}
            isLoading={isLoading}
            style={styles.btn}
          />
        </AppForm>

        <TouchableOpacity
          onPress={() => {
            setTimer(30);
            setIsResendDisabled(true);
            onResend();
          }}
          disabled={isResendDisabled}
          style={{ opacity: isResendDisabled ? 0.5 : 1, marginTop: 15 }}
        >
          <Text style={{ color: Colors.primary, textAlign: 'center' }}>
            {isResendDisabled
              ? t('verification.resendIn', { timer })
              : t('verification.resend')}
          </Text>
        </TouchableOpacity>
      </View>
    </ReactNativeModal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: Sizes.lg,
    borderRadius: Sizes.md,
  },
  title: {
    fontSize: Sizes.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Sizes.sm,
    fontFamily: 'PoppinsSemiBold',
  },
  subtitle: {
    fontSize: Sizes.md,
    color: Colors.gray600,
    marginBottom: Sizes.md,
  },
  errorMessage: {
    fontSize: Sizes.sm,
    color: Colors.danger,
    // marginBottom: Sizes.sm,
  },
  btn: {
    marginTop: Sizes.md,
  },
});

export default VerificationModal;
