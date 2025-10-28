import { updateUserName } from '@/appwriteFuncs/usersFunc';
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
  name: Yup.string().required('Name is required'),
});

const EditName = () => {
  const { user, fetchData } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateUser = async (values: any) => {
    try {
      setIsLoading(true);
      await updateUserName(user.$id, values.name);
      showToast('Name updated successfully', 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating name:', error);
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
          name: user?.name,
        }}
        onSubmit={handleUpdateUser}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <FormField
            name="name"
            label="Name"
            placeholder="Enter your name"
            inputContainer={styles.inputStyle}
            icon="person-outline"
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

export default EditName;

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
