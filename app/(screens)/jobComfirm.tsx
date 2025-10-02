import { createJob } from '@/appwriteFuncs/appwriteGenFunc';
import AppForm from '@/component/Form/AppForm';
import DropdownPicker from '@/component/Form/DropdownPicker';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import SuccessModal from '@/component/SuccessModal';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { JobFormValues } from '@/types/genTypes';
import {
  confirmationJobSchemaThreeFields,
  confirmationJobSchemaTwoFields,
} from '@/Utils/ValidationShema';
import { useLocalSearchParams, useRouter } from 'expo-router';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const salaryTypes = [
  { label: 'Per Hour', id: 'hour' },
  { label: 'Per Day', id: 'day' },
  { label: 'Per Month', id: 'month' },
  { label: 'Per Year', id: 'year' },
];

type SalaryFormValues = {
  salary: string;
  salaryType: string;
  maxApplicants: string;
};

export default function JobComfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isModalVisible, seIsModalVisible] = useState(false);

  const handleSubmit = async (values: SalaryFormValues) => {
    const fullJobData: JobFormValues = {
      title: Array.isArray(params.jobTitle)
        ? params.jobTitle[0]
        : params.jobTitle || '',
      skills: Array.isArray(params.skillsId)
        ? params.skillsId[0]
        : params.skillsId || '',
      type: Array.isArray(params.typeId)
        ? params.typeId[0]
        : params.typeId || '',
      locations: Array.isArray(params.locationId)
        ? params.locationId[0]
        : params.locationId || '',
      description: Array.isArray(params.description)
        ? params.description[0]
        : params.description || '',
      salary: values.salary,
      salaryType: values.salaryType,
      maxApplicants: values.maxApplicants,
      recruiters: user?.recruiters?.$id ?? '',
    };

    try {
      await createJob(fullJobData);
      seIsModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <AppForm
              initialValues={{
                salary: '',
                salaryType: '',
                maxApplicants: '',
              }}
              onSubmit={handleSubmit}
              validationSchema={
                params?.typeId === 'contract'
                  ? confirmationJobSchemaTwoFields
                  : confirmationJobSchemaThreeFields
              }
            >
              {params.typeId === 'contract' ? (
                // ✅ Contract Job → only Contract Budget
                <FormField
                  name="salary"
                  label={t('formLabels.salary.budgetLabel')}
                  placeholder={t('formLabels.salary.budgetPlaceholder')}
                  keyboardType="number-pad"
                  inputContainer={styles.inputStyle}
                  inputContainerStyles={styles.inputContainer}
                />
              ) : (
                <>
                  {/* ✅ Non-contract Jobs → Payment Rate + Payment Value */}
                  <DropdownPicker
                    name="salaryType"
                    label={t('formLabels.salaryType.label')}
                    placeholder={t('formLabels.salaryType.placeholder')}
                    data={salaryTypes}
                    inputContainer={styles.inputStyle}
                  />

                  <FormField
                    name="salary"
                    label={t('formLabels.salary.label')}
                    placeholder={t('formLabels.salary.placeholder')}
                    keyboardType="number-pad"
                    inputContainer={styles.inputStyle}
                    inputContainerStyles={styles.inputContainer}
                  />
                </>
              )}

              {/* ✅ Common field for all job types */}
              <View style={styles.formGroup}>
                <FormField
                  name="maxApplicants"
                  label={t('formLabels.maxApplicants.label')}
                  placeholder={t('formLabels.maxApplicants.placeholder')}
                  keyboardType="number-pad"
                  inputContainer={styles.inputStyle}
                />

                <Text style={styles.noteText}>
                  Note: The maximum number of applicants is the total number of
                  people you want to apply for this job. You can then select the
                  ones that best suit you.
                </Text>
              </View>

              <SubmitButton
                title={t('buttons.postJob')}
                style={styles.btnStyle}
              />
            </AppForm>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <SuccessModal
        visible={isModalVisible}
        onClose={() => seIsModalVisible(false)}
        iconName="briefcase"
        iconColor={Colors.primary}
        title={t('successModal.jobPostingSuccessful')}
        subtitle={t('successModal.jobPostingSubtitle')}
        primaryButtonTitle={t('buttons.viewDetails')}
        onPrimaryPress={() => router.push('/jobDetails')}
        secondaryButtonTitle={t('buttons.backToHome')}
        onSecondaryPress={() => router.push('/')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.sm,
  },
  inputStyle: {
    borderRadius: Sizes.sm,
  },
  inputContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 14,
    color: Colors.gray600,
    marginTop: 8,
    lineHeight: 20,
  },
  btnStyle: {
    borderRadius: Sizes.sm,
    marginVertical: Sizes.md,
  },
});
