import * as yup from 'yup';

export const doctorValidationSchema = yup.object().shape({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  specialization: yup.string()
    .required('Specialization is required')
    .min(2, 'Specialization must be at least 2 characters'),
  hospital: yup.string().optional(),
  phone: yup.string()
    .matches(/^[+]?[\d\s-]+$/, 'Invalid phone number')
    .optional(),
  email: yup.string()
    .email('Invalid email address')
    .optional(),
  address: yup.string().optional(),
  bio: yup.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
});

export const validateDoctor = async (data: any) => {
  try {
    await doctorValidationSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
};
