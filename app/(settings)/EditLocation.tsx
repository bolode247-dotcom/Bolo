import { getFilteredLocations } from '@/appwriteFuncs/appwriteGenFunc';
import { updateUserLocation } from '@/appwriteFuncs/usersFunc';
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
  locations: Yup.string().required('Location is required'),
  otherLocation: Yup.string(),
});

const EditLocation = () => {
  const { user, fetchData } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showLocModal, setShowLocModal] = React.useState(false);
  const [locations, setLocations] = useState<PickerItem<string>[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const handleSearchLocation = async (text: string) => {
    setLoadingLocations(true);
    const res = await getFilteredLocations(text);
    setLocations(res.map((loc: any) => ({ id: loc.id, label: loc.label })));
    setLoadingLocations(false);
  };

  const handleUpdateUser = async (values: any) => {
    try {
      setIsLoading(true);
      await updateUserLocation(
        user.$id,
        values.locations,
        values.otherLocation,
      );
      showToast('Location updated successfully', 'success');
      await fetchData();
    } catch (error: any) {
      console.error('Error updating location:', error);
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
          locations: user?.locations?.$id || '',
          otherLocation: user?.otherLocation,
        }}
        onSubmit={handleUpdateUser}
        validationSchema={validationSchema}
      >
        <View style={styles.inputContainer}>
          <CustomPickerField
            name="locations"
            label={t('formLabels.jobLocation.label')}
            placeholder={t('formLabels.jobLocation.placeholder')}
            openModal={() => setShowLocModal(true)}
            data={locations || []}
            inputContainer={styles.inputStyle}
          />
          <FormField
            name="otherLocation"
            label={t('formLabels.addressLine2.label')}
            placeholder={t('formLabels.addressLine2.placeholder')}
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
                visible={showLocModal}
                onClose={() => setShowLocModal(false)}
                data={locations}
                title="Select Location"
                showSearch
                isLoading={loadingLocations}
                onSearch={handleSearchLocation}
                initialSelectedId={values.locations}
                onSelect={(item) => setFieldValue('locations', item.id)}
              />
            )}
          </FormikConsumer>
        </View>
      </AppForm>
    </SafeAreaView>
  );
};

export default EditLocation;

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
