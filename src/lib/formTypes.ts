export type RegisterFormValues = {
  name: string;
  email: string;
  logo: File | null;
  about: string;
  address: string;
  phone: string;
  password: string;
};

export type ForgotPasswordValues = {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
};

export type Forgotpassword = ForgotPasswordValues;
