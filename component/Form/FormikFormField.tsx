import { useFormikContext } from 'formik';
import OTPInput from '../OTPInput';

const FormikOTPField = ({
  name,
  length = 6,
}: {
  name: string;
  length?: number;
}) => {
  const { setFieldValue, values, setFieldTouched } = useFormikContext<{
    [k: string]: string;
  }>();

  const otpString = values[name] ?? '';
  const otpArray = Array.from({ length }, (_, i) => otpString[i] || '');

  const handleChange = (newOtp: string[]) => {
    setFieldValue(name, newOtp.join(''));
    setFieldTouched(name, true, false);
  };

  return <OTPInput value={otpArray} setValue={handleChange} length={length} />;
};

export default FormikOTPField;
