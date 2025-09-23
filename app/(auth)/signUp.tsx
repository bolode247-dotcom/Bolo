import {
  createAccount,
  OtpVerification,
  sendOTP,
} from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import VerificationModal from '@/component/VerificationsModal';
import { images } from '@/constants';
// Ensure images.signUpImg is imported as require('...') or an object, not a string
import Colors from '@/constants/Colors'; // Assuming you have the colors object
import { useAuth } from '@/context/authContex';
import { signupValidationSchema } from '@/Utils/ValidationShema';
import { Link, router, useLocalSearchParams } from 'expo-router';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const SignUp = () => {
  const { t } = useTranslation();
  const { role } = useLocalSearchParams();
  const { fetchData } = useAuth();
  const [showVerification, setShowVerification] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [userId, setUserId] = React.useState<string | null>(null);
  const [isVerirying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);

  const handleOtpSubmit = async (values: { otpCode: string }) => {
    const { otpCode } = values;
    if (!userId) {
      Alert.alert('Error', 'User ID is missing.');
      return;
    }
    setIsVerifying(true);
    try {
      await OtpVerification(userId, otpCode);
      setShowVerification(false);
      await fetchData();
      router.replace('/(tabs)/');
    } catch (error: any) {
      setOtpError(error.message);
      return;
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignup = async (values: {
    fullName: string;
    email: string;
    phoneNumber: string;
    // location: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await createAccount({ ...values, role } as any);
      setUserId(res.userId);
      setEmail(values.email);
      setShowVerification(true);
    } catch (error: any) {
      setError(error.message);
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
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
              <View style={styles.cloudOverlay} />
              <View style={styles.headerTextWrapper}>
                <Text style={styles.headerTitle}>
                  {t('signUp.headerTitle')}
                </Text>
                {error && <Text style={styles.headerSubtitle}>{error}</Text>}
              </View>
            </View>
            <AppForm
              initialValues={{
                fullName: '',
                email: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
              }}
              onSubmit={handleSignup}
              validationSchema={signupValidationSchema}
            >
              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <FormField
                  name="fullName"
                  label={t('formLabels.fullName.label')}
                  icon="person"
                  placeholder={t('formLabels.fullName.placeholder')}
                />
                <FormField
                  name="email"
                  label={t('formLabels.email.label')}
                  icon="mail"
                  placeholder={t('formLabels.email.placeholder')}
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <FormField
                  label={t('formLabels.phoneNumber.label')}
                  name="phoneNumber"
                  icon="call"
                  placeholder={t('formLabels.phoneNumber.placeholder')}
                  keyboardType="phone-pad"
                />
                <FormField
                  label={t('formLabels.password.label')}
                  name="password"
                  icon="lock-closed"
                  placeholder={t('formLabels.password.placeholder')}
                  secureTextEntry
                />
                <FormField
                  label={t('formLabels.confirmPassword.label')}
                  name="confirmPassword"
                  icon="lock-closed"
                  placeholder={t('formLabels.confirmPassword.placeholder')}
                  secureTextEntry
                />
                {/* <SearchablePicker
                  name="location"
                  label={t('formLabels.location.label')}
                  icon="location"
                  placeholder={t('formLabels.location.placeholder')}
                  data={locations ?? []}
                /> */}
              </View>
              <SubmitButton
                title={t('signUp.submit')}
                style={{
                  width: '90%',
                  marginHorizontal: 'auto',
                  marginVertical: 20,
                }}
                isLoading={isSubmitting}
              />
            </AppForm>
            <View style={styles.footer}>
              <Text style={styles.footerText}>{t('signUp.footerText')}</Text>
              <TouchableOpacity>
                <Link href={'./signIn'} style={styles.footerLink}>
                  {t('signUp.footerLink')}
                </Link>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <VerificationModal
        visible={showVerification}
        email={email} // Pass the updated phone number
        onClose={() => setShowVerification(false)}
        isLoading={isVerirying}
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
    </SafeAreaView>
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
    height: 100,
  },
  headerImage: {
    width: '100%',
    height: 100,
  },
  cloudOverlay: {
    ...StyleSheet.absoluteFillObject, // fill the wrapper
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
  headerTextWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 40,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 28, // text-2xl
    color: Colors.black,
    fontFamily: 'PoppinsSemiBold',
  },
  headerSubtitle: {
    fontSize: 12, // text-md
    color: Colors.danger,
    fontFamily: 'PoppinsSemiBold',
    marginTop: 2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    // marginBottom: 32,
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

export default SignUp;
