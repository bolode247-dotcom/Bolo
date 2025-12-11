import { updateUserBio } from '@/appwriteFuncs/usersFunc';
import AppForm from '@/component/Form/AppForm';
import FormField from '@/component/Form/FormField';
import SubmitButton from '@/component/Form/SubmitButton';
import { Colors, Sizes } from '@/constants';
import { useAuth } from '@/context/authContex';
import { useToast } from '@/context/ToastContext';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  bio: Yup.string()
    .required('Bio is required')
    .max(300, 'Bio cannot exceed 300 characters'),
});

const EditBio = () => {
  const { user, fetchData } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  console.log('user bio: ', user?.bio);
  const handleUpdateUser = async (values: any) => {
    try {
      setIsLoading(true);
      await updateUserBio(user?.$id, values.bio);
      showToast('Bio updated successfully', 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating bio:', error);
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
          bio: user?.bio,
        }}
        onSubmit={handleUpdateUser}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <FormField
            name="bio"
            label="Bio"
            placeholder="Enter your bio"
            inputContainer={styles.inputStyle}
            multiline
            numberOfLines={6}
          />

          <SubmitButton
            title="Save"
            style={styles.btnStyle}
            isLoading={isLoading}
          />
        </View>
      </AppForm>
    </SafeAreaView>
  );
};

export default EditBio;

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
    justifyContent: 'space-between',
  },
});
