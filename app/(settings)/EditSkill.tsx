import { getFilteredSkills } from '@/appwriteFuncs/appwriteGenFunc';
import { updateUserSkills } from '@/appwriteFuncs/usersFunc';
import CustomPickerModal, { PickerItem } from '@/component/CustomPickerModal';
import AppForm from '@/component/Form/AppForm';
import CustomPickerField from '@/component/Form/CurstomPickerField';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import { FormikConsumer } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  skills: Yup.string().required('Skill is required'),
  otherSkill: Yup.string(),
});

const EditSkill = () => {
  const { user, fetchData } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = React.useState(false);
  const [skills, setSkills] = useState<PickerItem<string>[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  console.log('user skills:', user?.skills?.$id);

  const handleSearchSkill = async (text: string) => {
    setLoadingSkills(true);
    const res = await getFilteredSkills(text);
    setSkills(res.map((s: any) => ({ id: s.id, label: s.label })));
    setLoadingSkills(false);
  };

  const handleUpdateUser = async (values: any) => {
    try {
      setIsLoading(true);
      await updateUserSkills(
        user.$id,
        user?.workers?.$id,
        values.skills,
        values.otherSkill,
      );
      showToast('Skills updated successfully', 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating skills:', error);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView
      edges={['bottom']}
      style={{ flex: 1, padding: Sizes.sm, backgroundColor: Colors.background }}
    >
      <AppForm
        initialValues={{
          otherSkill: user?.workers?.otherSkill || '',
          skills: user?.skills?.$id || '',
        }}
        onSubmit={handleUpdateUser}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <CustomPickerField
            name="skills"
            label={t('formLabels.mainSkill.label')}
            placeholder={t('formLabels.mainSkill.placeholder')}
            openModal={() => setShowSkillsModal(true)}
            data={skills || []}
            inputContainer={styles.inputStyle}
          />
          <FormField
            name="otherSkill"
            label={t('formLabels.subSkills.label')}
            placeholder={t('formLabels.subSkills.placeholder')}
            inputContainer={styles.inputStyle}
            icon="person-outline"
          />

          <SubmitButton
            title="Update"
            style={styles.btnStyle}
            isLoading={isLoading}
          />
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
        </View>
      </AppForm>
    </SafeAreaView>
  );
};

export default EditSkill;

const styles = StyleSheet.create({
  inputStyle: {
    borderRadius: Sizes.sm,
  },
  btnStyle: {
    borderRadius: Sizes.sm,
    marginVertical: Sizes.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
});
