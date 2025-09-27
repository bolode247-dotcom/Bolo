import * as Yup from 'yup';

export const signupValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .test('is-full-name', 'Enter at least two names', (value) => {
      if (!value) return false;
      return value.trim().split(/\s+/).length >= 2;
    })
    .label('Full name'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .label('Email'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^6\d{8}$/, 'Invalid phone number format')
    .label('Phone Number'),
  location: Yup.string().required('Please select a location').label('Location'),
  skills: Yup.string()
    .required('Please select a profession')
    .label('Profession'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .label('Password'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
    .label('Confirm Password'),
});

export const signupVerificationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^6\d{8}$/, 'Invalid phone number format')
    .label('Phone Number'),
  location: Yup.string().required('Please select a location').label('Location'),
});

export const signInValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .label('Email'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .label('Password'),
});
