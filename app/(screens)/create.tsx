import { getLocations, getSkills } from '@/appwriteFuncs/appwriteGenFunc';
import CustomPickerModal from '@/component/CustomPickerModal';
import AppForm from '@/component/Form/AppForm';
import CustomPickerField from '@/component/Form/CurstomPickerField';
import DropdownPicker from '@/component/Form/DropdownPicker';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { Colors, Sizes } from '@/constants';
import useAppwrite from '@/lib/useAppwrite';
import { job } from '@/types/genTypes';
import { createJobSchema } from '@/Utils/ValidationShema';
import { router } from 'expo-router';
import { FormikConsumer } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const jobTypes = [
  { label: 'Full Time', id: 'full-time' },
  { label: 'Part Time', id: 'part-time' },
  { label: 'Contract', id: 'contract' },
  { label: 'Internship', id: 'Internship' },
];

const Craete = () => {
  const { t } = useTranslation();
  const [showLocModal, setShowLocModal] = React.useState(false);
  const [showSkillsModal, setShowSkillsModal] = React.useState(false);

  const { data: locations = [] } = useAppwrite(() => getLocations());
  const { data: skills = [] } = useAppwrite(() => getSkills());

  const handleSubmit = async (values: job) => {
    // Navigate to the next screen with query params
    router.push({
      pathname: '/(screens)/jobComfirm',
      params: {
        jobTitle: values.title,
        skillsId: values.skills, // ID of selected skill
        typeId: values.type, // ID of selected job type
        locationId: values.locations, // ID of selected location
        description: values.description,
      },
    });
  };
  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true} // <- allows dropdown to scroll inside
        >
          <AppForm
            initialValues={{
              title: '',
              skills: '',
              type: '',
              locations: '',
              description: '',
            }}
            onSubmit={handleSubmit}
            validationSchema={createJobSchema}
          >
            <FormField
              name="title"
              label={t('formLabels.jobTitle.label')}
              placeholder={t('formLabels.jobTitle.placeholder')}
              inputContainer={styles.inputStyle}
            />
            <CustomPickerField
              name="skills"
              label={t('formLabels.workerType.label')}
              placeholder={t('formLabels.workerType.placeholder')}
              openModal={() => setShowSkillsModal(true)}
              data={skills || []}
              inputContainer={styles.inputStyle}
            />
            <DropdownPicker
              name="type"
              label={t('formLabels.jobType.label')}
              placeholder={t('formLabels.jobType.placeholder')}
              data={jobTypes}
              inputContainer={styles.inputStyle}
            />
            <CustomPickerField
              name="locations"
              label={t('formLabels.jobLocation.label')}
              placeholder={t('formLabels.jobLocation.placeholder')}
              openModal={() => setShowLocModal(true)}
              data={locations || []}
              inputContainer={styles.inputStyle}
            />

            <FormField
              name="description"
              label={t('formLabels.JobDescription.label')}
              placeholder={t('formLabels.JobDescription.placeholder')}
              multiline
              numberOfLines={6}
              inputContainer={styles.inputStyle}
            />

            <SubmitButton
              title={t('buttons.continue')}
              style={styles.btnStyle}
              IconRight="arrow-forward"
            />

            <FormikConsumer>
              {({ setFieldValue, values }) => (
                <CustomPickerModal
                  visible={showLocModal}
                  onClose={() => setShowLocModal(false)}
                  data={locations || []}
                  title="Select Location"
                  showSearch
                  initialSelectedId={values.location}
                  onSelect={(item) => setFieldValue('locations', item.id)}
                />
              )}
            </FormikConsumer>
            <FormikConsumer>
              {({ setFieldValue, values }) => (
                <CustomPickerModal
                  visible={showSkillsModal}
                  onClose={() => setShowSkillsModal(false)}
                  data={skills || []}
                  title="Select Profession"
                  showSearch
                  initialSelectedId={values.skills}
                  onSelect={(item) => setFieldValue('skills', item.id)}
                />
              )}
            </FormikConsumer>
          </AppForm>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Craete;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
    paddingHorizontal: Sizes.sm,
  },
  inputStyle: {
    borderRadius: Sizes.sm,
  },
  btnStyle: {
    borderRadius: Sizes.sm,
    marginVertical: Sizes.md,
  },
});
