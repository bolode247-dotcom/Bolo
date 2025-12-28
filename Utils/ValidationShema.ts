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

export const createJobSchema = Yup.object().shape({
  title: Yup.string()
    .required('Job title is required')
    .max(35, 'Title cannot exceed 35 characters')
    .label('Title'),

  description: Yup.string()
    .required('Job description is required')
    .max(1000, 'Description cannot exceed 1000 characters')
    .label('Description'),

  type: Yup.string().required('Job type is required').label('Type'),

  skills: Yup.string()
    .required('Type of worker is required')
    .label('Worker type'),

  locations: Yup.string()
    .required('Job location is reruired')
    .label('Location'),
});
export const confirmationJobSchemaTwoFields = Yup.object().shape({
  minSalary: Yup.number().min(1000).label('Min Salary'),
  maxApplicants: Yup.number()
    .required('Maximum number of applicants is required')
    .typeError('Max applicants must be a number')
    .label('Max Applicants'),
  address: Yup.string()
    .label('Address')
    .max(100, 'Address cannot exceed 100 characters'),
});

// Schema when there are 3 fields
export const confirmationJobSchemaThreeFields = Yup.object().shape({
  minSalary: Yup.number().min(1000).label('Min Salary'),
  maxSalary: Yup.number().min(1000).label('Max Salary'),
  paymentType: Yup.string()
    .required('Payment rate is required')
    .label('Payment rate'),
  maxApplicants: Yup.number()
    .required('Maximum number of applicants is required')
    .typeError('Max applicants must be a number')
    .label('Max Applicants'),
  address: Yup.string()
    .label('Address')
    .max(100, 'Address cannot exceed 100 characters'),
});
