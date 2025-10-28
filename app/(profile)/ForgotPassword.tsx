import { passwordRecovery } from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { useToast } from '@/context/ToastContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import * as Yup from 'yup';
import { Colors, Sizes } from '../../constants';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required')
    .label('Email'),
});

const ForgottenPassword = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePassword = async (value: { email: string }) => {
    const { email } = value;
    setIsLoading(true);
    try {
      await passwordRecovery(email);
      showToast('Email sent successfully. check your mail box', 'success');
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[styles.screenContainer, { backgroundColor: Colors.background }]}
    >
      <View style={styles.container}>
        {error && <Text style={styles.headerSubtitle}>{error}</Text>}
        <AppForm
          initialValues={{ email: '' }}
          onSubmit={(values) => handlePassword(values)}
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

export default ForgottenPassword;
