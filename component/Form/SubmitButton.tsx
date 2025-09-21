import { SubmitButtonProps } from '@/types/buttons';
import { useFormikContext } from 'formik';
import React from 'react';
import CustomButton from '../CustomButton';

const SubmitButton: React.FC<SubmitButtonProps> = ({
  title,
  ...otherProps
}) => {
  const { handleSubmit } = useFormikContext();
  return <CustomButton title={title} onPress={handleSubmit} {...otherProps} />;
};

export default SubmitButton;
