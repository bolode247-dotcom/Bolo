import { getLocations, getSkills } from '@/appwriteFuncs/appwriteGenFunc';
import { updateUserDetails } from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import SearchablePicker from '@/component/Form/SearchablePicker';
import SubmitButton from '@/component/Form/SubmitButton';
import { images } from '@/constants';
// Ensure images.signUpImg is imported as require('...') or an object, not a string
import Colors from '@/constants/Colors'; // Assuming you have the colors object
import { useAuth } from '@/context/authContex';
import useAppwrite from '@/lib/useAppwrite';
import { locationSkillsShema } from '@/Utils/ValidationShema';
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

const AccountInfo = () => {
  const { t } = useTranslation();
  const { fetchData } = useAuth();
  const { accountId } = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(false);

  console.log('account id: ', accountId);

  const { data: locations } = useAppwrite(() => getLocations());
  const { data: skills } = useAppwrite(() => getSkills());

  const updateUser = async (values: { locations: string; skills: string }) => {
    setIsSubmitting(true);
    try {
      const res = await updateUserDetails(
        accountId,
        values.locations,
        values.skills,
      );
      await fetchData();
      router.replace('/');
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
                locations: '',
                skills: '',
              }}
              onSubmit={updateUser}
              validationSchema={locationSkillsShema}
            >
              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <SearchablePicker
                  name="locations"
                  label={t('formLabels.location.label')}
                  icon="location"
                  placeholder={t('formLabels.location.placeholder')}
                  data={locations ?? []}
                />
                <SearchablePicker
                  name="skills"
                  label={t('formLabels.skills.label')}
                  icon="flash"
                  placeholder={t('formLabels.skills.placeholder')}
                  data={skills ?? []}
                />
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

export default AccountInfo;
