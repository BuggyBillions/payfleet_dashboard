import * as Yup from "yup";

export const RegisterFormSchema = Yup.object({
  name: Yup.string().required("Company name is required."),
  email: Yup.string().required("Company email is required."),
  logo: Yup.mixed().nullable(),
  about: Yup.string().required("About company is required."),
  address: Yup.string().required("Company address is required."),
  password: Yup.string().required("password is required."),
});

export const ForgotPasswordSchema = Yup.object({
  name: Yup.string().required("Name is required."),
  email: Yup.string().required("Email is required."),
});

export const Forgotpassword = ForgotPasswordSchema;

export const LoginFormSchema = Yup.object({
  email: Yup.string().required("Email Address is required."),
  password: Yup.string().required("password is required."),
});

export const AddEmployeeSchema = Yup.object({
  company_id: Yup.string().required("Company Id is required"),
  first_name: Yup.string().required("First Name is required"),
  last_name: Yup.string().required("Last Name is required"),
  email: Yup.string().required("Email Address is required"),
  phone_number: Yup.string().required("Phone number is required"),
  address: Yup.string().required("Address is required"),
  job_title: Yup.string().required("Job Title is required"),
  employment_type: Yup.string().required("Employment Type is required"),
  bank_name: Yup.string().required("Bank Name is required"),
  account_number: Yup.number()
    .min(10, "Account number must be 10 characters")
    .required("Account Number is required"),
  estimate_pay: Yup.string().required("Estimate Pay is required"),
});
