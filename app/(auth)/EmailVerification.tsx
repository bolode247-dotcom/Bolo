import {
  forgotPassword,
  OtpVerification,
  sendOTP,
} from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import VerificationModal from '@/component/VerificationsModal';
import { useAuth } from '@/context/authContex';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import { Colors, Sizes } from '../../constants';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required')
    .label('Email'),
});

const EmailVerification = () => {
  const { t } = useTranslation();
  const { fetchData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);

  const handleContinue = async (value: { email: string }) => {
    const { email } = value;
    setIsLoading(true);
    try {
      console.log('forgot password before');

      const userId = await forgotPassword(email);

      setUserId(userId);
      setEmail(email);
      setShowVerification(true);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async ({ otpCode }: { otpCode: string }) => {
    if (!userId) {
      Alert.alert('Error', 'User ID is missing.');
      return;
    }
    try {
      setIsLoading(true);
      await OtpVerification(userId, otpCode);
      setShowVerification(false);
      await fetchData();
      router.replace('/');
    } catch (err: any) {
      setOtpError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.screenContainer, { backgroundColor: Colors.background }]}
    >
      <View style={styles.container}>
        {/* <Text style={[styles.title, { color: Colors.text }]}>
          {t('emailVerification.title')}
        </Text> */}
        {error && <Text style={styles.headerSubtitle}>{error}</Text>}
        <AppForm
          initialValues={{ email: '' }}
          onSubmit={(values) => handleContinue(values)}
          validationSchema={validationSchema}
        >
          <View style={styles.inputContainer}>
            <FormField
              placeholder={t('formLabels.email.placeholder')}
              name="email"
              label={t('formLabels.email.label')}
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>
          <SubmitButton
            title={t('emailVerification.submit')}
            style={styles.button}
            isLoading={isLoading}
          />
        </AppForm>
      </View>

      <VerificationModal
        visible={showVerification}
        email={email}
        onClose={() => setShowVerification(false)}
        isLoading={isLoading}
        onSubmit={handleOtpSubmit}
        errorMessage={otpError || ''}
        onResend={async () => {
          try {
            const newOtp = await sendOTP(email);
            setUserId(newOtp);
          } catch {
            Alert.alert('Error', 'Could not resend OTP');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  container: {
    marginTop: Sizes.x3l,
    paddingHorizontal: Sizes.sm,
  },
  title: {
    fontSize: Sizes.lg,
    fontWeight: 'bold',
    marginBottom: Sizes.sm,
  },
  headerSubtitle: {
    fontSize: 14, // text-md
    color: Colors.danger,
    fontFamily: 'PoppinsSemiBold',
    marginVertical: 2,
  },
  inputContainer: {
    marginBottom: Sizes.md,
  },
  button: {
    borderRadius: Sizes.sm,
    paddingVertical: Sizes.sm,
  },
  footerText: {
    textAlign: 'center',
    marginTop: Sizes.lg,
    fontSize: Sizes.md,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: '80%',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: Sizes.lg,
    marginBottom: Sizes.sm,
    color: '#00d341',
  },
  modalMessage: {
    fontSize: Sizes.md,
    marginBottom: Sizes.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalButton: {
    marginHorizontal: 7,
    borderRadius: 10,
    alignItems: 'flex-end',
  },
  cancelButton: {
    color: '#f44336',
  },
  continueButton: {
    color: '#2ac130',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EmailVerification;
