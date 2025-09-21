import { getLocations } from '@/appwriteFuncs/appwriteGenFunc';
import { createAccount } from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SearchablePicker from '@/component/Form/SearchablePicker';
import SubmitButton from '@/component/Form/SubmitButton';
import VerificationModal from '@/component/VerificationsModal';
import { images } from '@/constants';
import Colors from '@/constants/Colors'; // Assuming you have the colors object
import useAppwrite from '@/lib/useAppwrite';
import { signupVerificationSchema } from '@/Utils/ValidationShema';
import { Link, useLocalSearchParams } from 'expo-router';
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

const Verification = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const [showVerification, setShowVerification] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [otpId, setOtpId] = React.useState<string | null>(null);
  const [phonNumber, setPhoneNumber] = React.useState('');

  const {
    data: locations,
    isLoading,
    error,
  } = useAppwrite(() => getLocations());

  const sendOTP = async (phone: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('mock-otp-id-123456');
      }, 1000);
    });
  };

  const handleOtpSubmit = async (values: { otpCode: string }) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowVerification(false);
      alert('Phone number verified successfully!');
    }, 2000);
  };

  const handleSignup = async (values: {
    phoneNumber: string;
    location: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createAccount({ ...params, ...values } as any);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
      setIsSubmitting(false);
      return;
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
              <Text style={styles.headerTitle}>{t('signUp.headerTitle')}</Text>
              {/* <Text style={styles.headerSubtitle}>
                  {JSON.stringify(params)}
                </Text> */}
            </View>
          </View>

          <AppForm
            initialValues={{ phoneNumber: '', location: '' }}
            onSubmit={handleSignup}
            validationSchema={signupVerificationSchema}
          >
            <View style={styles.inputContainer}>
              <FormField
                label={t('formLabels.phoneNumber.label')}
                name="phoneNumber"
                icon="call"
                placeholder={t('formLabels.phoneNumber.placeholder')}
                keyboardType="phone-pad"
              />
              <SearchablePicker
                name="location"
                label={t('formLabels.location.label')}
                icon="location"
                placeholder={t('formLabels.location.placeholder')}
                data={locations ?? []}
              />
            </View>
            <SubmitButton
              title={t('signUp.submit')}
              isLoading={isSubmitting}
              style={{
                width: '90%',
                marginHorizontal: 'auto',
                marginVertical: 20,
              }}
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

        <VerificationModal
          visible={showVerification}
          phoneNumber={phonNumber} // Pass the updated phone number
          onClose={() => setShowVerification(false)}
          isLoading={isSubmitting}
          onSubmit={handleOtpSubmit}
          onResend={async () => {
            try {
              const newOtp = await sendOTP(phonNumber);
              setOtpId(newOtp);
            } catch {
              Alert.alert('Error', 'Could not resend OTP');
            }
          }}
        />
      </ScrollView>
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
    height: 259,
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
    fontSize: 28, // text-2xl
    color: Colors.black,
    fontFamily: 'PoppinsSemiBold',
  },
  headerSubtitle: {
    fontSize: 16, // text-md
    color: Colors.gray600 || '#737373',
    fontFamily: 'PoppinsSemiBold',
    marginTop: 2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
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

export default Verification;
