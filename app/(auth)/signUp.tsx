import {
  getFilteredLocations,
  getFilteredSkills,
} from '@/appwriteFuncs/appwriteGenFunc';
import { createAccount } from '@/appwriteFuncs/usersFunc';
import CustomPickerModal, { PickerItem } from '@/component/CustomPickerModal';
import AppForm from '@/component/Form/AppForm';
import CustomPickerField from '@/component/Form/CurstomPickerField';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { images, Sizes } from '@/constants';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { signupValidationSchema } from '@/Utils/ValidationShema';
import { Link, useLocalSearchParams } from 'expo-router';
import { FormikConsumer } from 'formik';
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
  const { showToast } = useToast();
  const { fetchData } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showLocModal, setShowLocModal] = React.useState(false);
  const [showSkillsModal, setShowSkillsModal] = React.useState(false);
  const [locations, setLocations] = React.useState<PickerItem<string>[]>([]);

  const [loadingLocations, setLoadingLocations] = React.useState(false);

  const handleSearchLocation = async (text: string) => {
    setLoadingLocations(true);
    const res = await getFilteredLocations(text);
    setLocations(res.map((loc: any) => ({ id: loc.id, label: loc.label })));
    setLoadingLocations(false);
  };

  const [skills, setSkills] = React.useState<PickerItem<string>[]>([]);
  const [loadingSkills, setLoadingSkills] = React.useState(false);

  const handleSearchSkill = async (text: string) => {
    setLoadingSkills(true);
    const res = await getFilteredSkills(text);
    setSkills(res.map((s: any) => ({ id: s.id, label: s.label })));
    setLoadingSkills(false);
  };

  const handleSignup = async (values: {
    fullName: string;
    email: string;
    location: string;
    skills: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsSubmitting(true);
    try {
      await createAccount({ ...values, role } as any);
      await fetchData();
    } catch (error: any) {
      showToast(error.message, 'error');
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.white }}
      edges={['top', 'right', 'left']}
    >
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
              </View>
            </View>
            <AppForm
              initialValues={{
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                location: '',
                skills: '',
              }}
              onSubmit={handleSignup}
              validationSchema={signupValidationSchema}
            >
              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <FormField
                  name="fullName"
                  icon="person"
                  placeholder={t('formLabels.fullName.label')}
                />
                <FormField
                  name="email"
                  icon="mail"
                  placeholder={t('formLabels.email.label')}
                  keyboardType="email-address"
                  autoComplete="email"
                />
                <CustomPickerField
                  name="location"
                  icon="location"
                  placeholder={t('formLabels.location.label')}
                  openModal={() => setShowLocModal(true)}
                  data={locations || []}
                />
                <CustomPickerField
                  name="skills"
                  icon="flash"
                  placeholder={t('formLabels.skills.label')}
                  openModal={() => setShowSkillsModal(true)}
                  data={skills || []}
                />
                <FormField
                  name="password"
                  icon="lock-closed"
                  placeholder={t('formLabels.password.label')}
                  secureTextEntry
                />
                <FormField
                  name="confirmPassword"
                  icon="lock-closed"
                  placeholder={t('formLabels.confirmPassword.label')}
                  secureTextEntry
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
              <FormikConsumer>
                {({ setFieldValue, values }) => (
                  <CustomPickerModal
                    visible={showLocModal}
                    onClose={() => setShowLocModal(false)}
                    data={locations}
                    title="Select Location"
                    showSearch
                    isLoading={loadingLocations}
                    onSearch={handleSearchLocation}
                    initialSelectedId={values.location}
                    onSelect={(item) => setFieldValue('location', item.id)}
                  />
                )}
              </FormikConsumer>
              <FormikConsumer>
                {({ setFieldValue, values }) => (
                  <CustomPickerModal
                    visible={showSkillsModal}
                    onClose={() => setShowSkillsModal(false)}
                    data={skills}
                    title="Select Skill"
                    showSearch
                    isLoading={loadingSkills}
                    onSearch={handleSearchSkill}
                    initialSelectedId={values.skills}
                    onSelect={(item) => setFieldValue('skills', item.id)}
                  />
                )}
              </FormikConsumer>
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
    paddingHorizontal: Sizes.sm,
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
