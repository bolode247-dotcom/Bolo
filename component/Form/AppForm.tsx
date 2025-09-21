import { Formik, FormikHelpers, FormikValues } from 'formik';
import React from 'react';

interface AppFormProps<T extends FormikValues> {
  initialValues: T;
  onSubmit: (
    values: T,
    formikHelpers: FormikHelpers<T>,
  ) => void | Promise<void>;
  validationSchema?: any;
  children: React.ReactNode;
}

function AppForm<T extends FormikValues>({
  initialValues,
  onSubmit,
  validationSchema,
  children,
}: AppFormProps<T>) {
  return (
    <Formik<T>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {() => <>{children}</>}
    </Formik>
  );
}

export default AppForm;
