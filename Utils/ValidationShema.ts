import i18n from 'i18next'; // directly use the i18n instance
import * as Yup from 'yup';

// Simple wrapper so you don't repeat i18n.t everywhere
const tt = (key: string) => i18n.t(key);

export const signupValidationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required(tt('validation.fullNameRequired'))
    .test(
      'is-full-name',
      tt('validation.fullNameTwoWords'), // add this new translation
      (value) => {
        if (!value) return false;
        return value.trim().split(/\s+/).length >= 2;
      },
    )
    .label(tt('formLabels.fullName.label')),
  password: Yup.string()
    .required(tt('validation.passwordRequired'))
    .min(8, tt('validation.passwordMin'))
    .max(20, tt('validation.passwordMax'))
    .label(tt('formLabels.password.label')),
  confirmPassword: Yup.string()
    .required(tt('validation.confirmPasswordRequired'))
    .oneOf([Yup.ref('password')], tt('validation.passwordsNotMatch'))
    .label(tt('formLabels.confirmPassword.label')),
  email: Yup.string()
    .email(tt('validation.emailInvalid'))
    .required(tt('validation.emailRequired'))
    .label(tt('formLabels.email.label')),
});

export const signupVerificationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required(tt('validation.phoneRequired'))
    .matches(/^6\d{8}$/, tt('validation.phoneFormat'))
    .label(tt('formLabels.phoneNumber')),
  location: Yup.string()
    .required(tt('validation.locationRequired'))
    .label(tt('formLabels.location')),
});

export const signInValidationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required(tt('validation.phoneRequired'))
    .matches(/^6\d{8}$/, tt('validation.phoneFormat'))
    .label(tt('formLabels.phoneNumber.label')),
  password: Yup.string()
    .required(tt('validation.passwordRequired'))
    .min(8, tt('validation.passwordMin'))
    .label(tt('formLabels.password.label')),
});
