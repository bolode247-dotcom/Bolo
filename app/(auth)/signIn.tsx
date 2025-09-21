import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { images } from '@/constants';
import Colors from '@/constants/Colors';
import { signInValidationSchema } from '@/Utils/ValidationShema';
import { Link } from 'expo-router';
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

const SignIn = () => {
  const { t } = useTranslation();
  const handleSignIn = (values: { phoneNumber: string; password: string }) => {
    console.log('Sign-In values:', values);
    // Simulate API call
    alert(`Signing in ${values.phoneNumber}`);
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
            </View>
          </View>

          <AppForm
            initialValues={{ phoneNumber: '', password: '' }}
            onSubmit={handleSignIn}
            validationSchema={signInValidationSchema}
          >
            <View style={styles.inputContainer}>
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
            </View>
            <SubmitButton
              title={t('signIn.submit')}
              style={{
                width: '90%',
                marginHorizontal: 'auto',
                marginVertical: 20,
              }}
            />
          </AppForm>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('signIn.noAccount')}</Text>
            <TouchableOpacity>
              <Link href={'./userRole'} style={styles.footerLink}>
                {t('signIn.signUpLink')}
              </Link>
            </TouchableOpacity>
          </View>
        </View>
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
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
