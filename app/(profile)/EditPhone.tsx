import { updateUserPhone } from '@/appwriteFuncs/usersFunc';
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
  phoneNumber: Yup.string().required('Phone number is required'),
});

const EditPhone = () => {
  const { user, fetchData } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateUser = async (values: any) => {
    try {
      setIsLoading(true);
      await updateUserPhone(user?.$id, values.phoneNumber);
      showToast('Phone number updated successfully', 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating Phone number:', error);
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
          phoneNumber: user?.phoneNumber,
        }}
        onSubmit={handleUpdateUser}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <FormField
            name="phoneNumber"
            label="Phone Number"
            placeholder="Enter your phone number"
            inputContainer={styles.inputStyle}
            maxLength={9}
            keyboardType="phone-pad"
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

export default EditPhone;

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
