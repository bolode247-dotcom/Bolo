import { useFormikContext } from 'formik';
import React from 'react';
import { View, ViewStyle } from 'react-native';

import InputField from '../InputField';
import ErrorMessage from './ErrorMessage';

interface AppFormFieldProps {
  name: string;
  label?: string;
  style?: ViewStyle;
  [key: string]: any;
}

const FormField: React.FC<AppFormFieldProps> = ({
  name,
  label,
  style,
  ...otherProps
}) => {
  const { setFieldTouched, handleChange, errors, touched, values } =
    useFormikContext<Record<string, any>>();
  return (
    <View style={style}>
      <InputField
        value={values[name]}
        label={label}
        onBlur={() => setFieldTouched(name)}
        onChangeText={handleChange(name)}
        {...otherProps}
      />
      <ErrorMessage
        error={
          typeof errors[name] === 'string'
            ? errors[name]
            : Array.isArray(errors[name])
              ? errors[name].join(', ')
              : undefined
        }
        visible={typeof touched[name] === 'boolean' ? touched[name] : undefined}
      />
    </View>
  );
};

export default FormField;
