import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { images } from '@/constants';
// Ensure images.signUpImg is imported as require('...') or an object, not a string
import Colors from '@/constants/Colors'; // Assuming you have the colors object
import { signupValidationSchema } from '@/Utils/ValidationShema';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
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
  console.log('User Role from params:', role); // Debugging line
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
              <View style={styles.headerTextWrapper}>
                <Text style={styles.headerTitle}>
                  {t('signUp.headerTitle')}
                </Text>
              </View>
            </View>
            <AppForm
              initialValues={{
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
              }}
              onSubmit={(values) =>
                router.push({
                  pathname: './phoneVerification',
                  params: { ...values, role: role || 'jobSeeker' },
                })
              }
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
                />

                <FormField
                  name="password"
                  label={t('formLabels.password.label')}
                  icon="lock-closed"
                  placeholder={t('formLabels.password.placeholder')}
                  secureTextEntry={true}
                />
                <FormField
                  name="confirmPassword"
                  label={t('formLabels.confirmPassword.label')}
                  icon="lock-closed"
                  placeholder={t('formLabels.confirmPassword.placeholder')}
                  secureTextEntry={true}
                />
              </View>
              <SubmitButton
                title={t('signUp.submit')}
                IconRight="arrow-forward"
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
        </ScrollView>
      </KeyboardAvoidingView>
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
    height: 150,
  },
  headerImage: {
    width: '100%',
    height: 150,
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

export default SignUp;
