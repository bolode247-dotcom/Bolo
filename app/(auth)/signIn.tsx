import {
  OtpVerification,
  sendOTP,
  SignInUser,
} from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import VerificationModal from '@/component/VerificationsModal';
import { images, Sizes } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/authContex';
import { signInValidationSchema } from '@/Utils/ValidationShema';
import { Link, router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SignIn = () => {
  const { t } = useTranslation();
  const { fetchData } = useAuth();
  const [showVerification, setShowVerification] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);

  const handleOtpSubmit = async (values: { otpCode: string }) => {
    const { otpCode } = values;
    console.log('otp code', otpCode);
    if (!userId) {
      Alert.alert('Error', 'User ID is missing.');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      await OtpVerification(userId, otpCode);
      await fetchData();
      setShowVerification(false);
    } catch (err: any) {
      setOtpError(err.message); // ✅ Use error state, not email
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignIn = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await SignInUser(values);
      console.log('user response:', res);

      if ('unverified' in res && res.unverified) {
        setUserId(res.userId);
        setEmail(res.email);
        setShowVerification(true);
        return;
      }
      await fetchData();
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                typeof images.signUpImg === 'string'
                  ? { uri: images.signUpImg }
                  : images.signUpImg
              }
              style={styles.headerImage}
              resizeMode="cover"
            />
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerTitle}>{t('signIn.headerTitle')}</Text>
              <Text style={styles.headerSubtitle}>{error}</Text>
            </View>
          </View>

          <AppForm
            initialValues={{ email: '', password: '' }}
            onSubmit={handleSignIn}
            validationSchema={signInValidationSchema}
          >
            <View style={styles.inputContainer}>
              <FormField
                label={t('formLabels.email.label')}
                name="email"
                icon="mail"
                placeholder={t('formLabels.email.placeholder')}
                keyboardType="email-address"
                autoComplete="email"
              />
              <FormField
                label={t('formLabels.password.label')}
                name="password"
                icon="lock-closed"
                placeholder={t('formLabels.password.placeholder')}
                secureTextEntry
              />
            </View>
            <View
              style={{
                paddingTop: Sizes.sm,
                paddingHorizontal: 20,
                flexDirection: 'row',
                gap: Sizes.xsm,
                justifyContent: 'flex-end',
              }}
            >
              <Link
                style={{
                  fontSize: Sizes.md,
                  color: Colors.primary,
                  fontWeight: '400',
                }}
                href="./EmailVerification"
              >
                {t('signIn.forgottenPassword')}
              </Link>
            </View>
            <SubmitButton
              title={t('signIn.submit')}
              style={{
                width: '90%',
                marginHorizontal: 'auto',
                marginVertical: 20,
              }}
              isLoading={isSubmitting}
            />
          </AppForm>

          <View style={styles.footer}>
            <TouchableOpacity>
              <Link href={'./userRole'} style={styles.footerLink}>
                {t('signIn.signUpLink')}
              </Link>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <VerificationModal
        visible={showVerification}
        email={email} // Pass the updated phone number
        onClose={() => setShowVerification(false)}
        isLoading={isVerifying}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 250,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  headerTextWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 40,
  },
  headerTitle: {
    fontSize: 28,
    color: Colors.black,
    fontFamily: 'PoppinsSemiBold',
  },
  headerSubtitle: {
    fontSize: 15, // text-md
    color: Colors.danger,
    fontFamily: 'PoppinsSemiBold',
    marginTop: 2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: Colors.gray500 || '#999999',
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primaryDark || '#279136',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },
});

export default SignIn;
