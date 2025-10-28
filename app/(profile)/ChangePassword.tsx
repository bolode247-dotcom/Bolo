import { updatePassword } from '@/appwriteFuncs/usersFunc';
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
  oldPassword: Yup.string()
    .required('Old password is required')
    .min(8, 'Password must be at least 8 characters')
    .label('Old Password'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .label('New Password'),
});

const ChangePassword = () => {
  const { user, fetchData } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (values: any) => {
    try {
      setIsLoading(true);
      await updatePassword(values.newPassword, values.oldPassword);
      showToast('Password updated successfully', 'success');
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
          oldPassword: '',
          newPassword: '',
        }}
        onSubmit={handleUpdatePassword}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <View>
            <FormField
              name="oldPassword"
              label="Old Password"
              placeholder="Enter your old password"
              inputContainer={styles.inputStyle}
              icon="lock-closed"
              secureTextEntry
            />
            <FormField
              name="newPassword"
              label="New Password"
              placeholder="Enter your new password"
              inputContainer={styles.inputStyle}
              icon="lock-closed"
              secureTextEntry
            />
            {/* <View
              style={{
                paddingTop: Sizes.sm,
                paddingHorizontal: 20,
                flexDirection: 'row',
                gap: Sizes.xsm,
                justifyContent: 'flex-end',
              }}
            >
              <Link
                style={{
                  fontSize: Sizes.md,
                  color: Colors.primary,
                  fontWeight: '400',
                }}
                href="./ForgotPassword"
              >
                Forgotten Password?
              </Link>
            </View> */}
          </View>

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

export default ChangePassword;

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
