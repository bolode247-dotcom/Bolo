import { sendPushNotification } from '@/appwriteFuncs/appwriteGenFunc';
import { createJob } from '@/appwriteFuncs/appwriteJobsFuncs';
import AppForm from '@/component/Form/AppForm';
import DropdownPicker from '@/component/Form/DropdownPicker';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import SuccessModal from '@/component/SuccessModal';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { Job } from '@/types/genTypes';
import {
  confirmationJobSchemaThreeFields,
  confirmationJobSchemaTwoFields,
} from '@/Utils/ValidationShema';
import { useLocalSearchParams, useRouter } from 'expo-router';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const paymentType = [
  { label: 'Per Hour', id: 'hour' },
  { label: 'Per Day', id: 'day' },
  { label: 'Per Month', id: 'month' },
  { label: 'Per Year', id: 'year' },
  { label: 'Not Disclosed', id: 'notDisclosed' },
];

type SalaryFormValues = {
  minSalary: number;
  maxSalary: number;
  paymentType: string;
  maxApplicants: string;
  address: string;
};

export default function JobComfirmation() {
  const { showToast } = useToast();
  const router = useRouter();
  const { title, skills, type, locations, description, workerId } =
    useLocalSearchParams<{
      title: string;
      skills: string;
      type: string;
      locations: string;
      description: string;
      workerId: string;
    }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isModalVisible, seIsModalVisible] = useState(false);
  const [jobId, setJobId] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  console.log('params: ', {
    workerId,
  });

  const handleSubmit = async (values: SalaryFormValues) => {
    const fullJobData: Job = {
      title,
      skills,
      type,
      locations,
      description,
      workerId,
      minSalary: values.minSalary,
      maxSalary: values.maxSalary,
      paymentType: values.paymentType,
      maxApplicants: values.maxApplicants,
      address: values.address,
      recruiters: user?.recruiters?.$id,
    };
    setIsPosting(true);
    try {
      console.log('fullJobData: ', fullJobData);
      const jobId = await createJob(fullJobData);
      setJobId(jobId);
      seIsModalVisible(true);
      if (workerId) {
        sendPushNotification({
          type: 'job_offer',
          workerId,
        });
      } else {
        sendPushNotification({
          type: 'job_created',
          jobId,
        });
      }
    } catch (error: any) {
      showToast(error.message, 'error');
    }
    setIsPosting(false);
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
                minSalary: 0,
                maxSalary: 0,
                paymentType: '',
                maxApplicants: workerId ? '1' : '0',
                address: '',
              }}
              onSubmit={handleSubmit}
              validationSchema={
                type === 'contract'
                  ? confirmationJobSchemaTwoFields
                  : confirmationJobSchemaThreeFields
              }
            >
              <FormField
                name="address"
                label={t('formLabels.addressLine2.label')}
                placeholder={t('formLabels.addressLine2.placeholder')}
                inputContainer={styles.inputStyle}
              />

              {type === 'contract' ? (
                <FormField
                  name="minSalary"
                  label={t('formLabels.salary.budgetLabel')}
                  placeholder={t('formLabels.salary.budgetPlaceholder')}
                  keyboardType="number-pad"
                  inputContainer={styles.inputStyle}
                  inputContainerStyles={styles.inputContainer}
                />
              ) : (
                <>
                  <DropdownPicker
                    name="paymentType"
                    label={t('formLabels.paymentType.label')}
                    placeholder={t('formLabels.paymentType.placeholder')}
                    data={paymentType}
                    inputContainer={styles.inputStyle}
                  />

                  <View>
                    <Text style={styles.label}>
                      {t('formLabels.salary.label')}
                    </Text>
                    <View style={styles.formRow}>
                      <FormField
                        name="minSalary"
                        placeholder={t(
                          'formLabels.salary.minSalaryPlaceholder',
                        )}
                        keyboardType="number-pad"
                        inputContainer={styles.inputRowStyle}
                        style={{ width: '45%' }}
                        maxLength={7}
                      />
                      <Text
                        style={{
                          marginHorizontal: 8,
                          fontFamily: 'PoppinsSemiBold',
                        }}
                      >
                        To
                      </Text>
                      <FormField
                        name="maxSalary"
                        placeholder={t(
                          'formLabels.salary.maxSalaryPlaceholder',
                        )}
                        keyboardType="number-pad"
                        style={{ width: '45%' }}
                        inputContainer={styles.inputRowStyle}
                        maxLength={7}
                      />
                    </View>
                  </View>
                </>
              )}

              {!workerId && (
                <View style={styles.formGroup}>
                  <FormField
                    name="maxApplicants"
                    label={t('formLabels.maxApplicants.label')}
                    placeholder={t('formLabels.maxApplicants.placeholder')}
                    keyboardType="number-pad"
                    inputContainer={styles.inputStyle}
                    minValue={1}
                  />

                  <Text style={styles.noteText}>
                    Note: The maximum number of applicants is the total number
                    of people you want to apply for this job. You can then
                    select the ones that best suit you.
                  </Text>
                </View>
              )}

              <SubmitButton
                title={workerId ? t('buttons.postJob') : t('buttons.offerJob')}
                style={styles.btnStyle}
                isLoading={isPosting}
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
        onPrimaryPress={() => {
          router.replace({
            pathname: '/myJobDetails',
            params: { jobId },
          });
        }}
        secondaryButtonTitle={t('buttons.backToHome')}
        onSecondaryPress={() => router.replace('/')}
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
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  inputRowStyle: {
    borderRadius: Sizes.sm,
  },
  label: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: Colors.gray800,
    marginBottom: 4,
  },
});
