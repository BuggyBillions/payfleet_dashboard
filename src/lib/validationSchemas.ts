import * as Yup from "yup";
import { passwordValidationSchema } from "../helpers/passwordUtils";

export { passwordValidationSchema };

export const RegisterFormSchema = Yup.object({
  // reg_no: Yup.string().required("Company registration number is required"),
  name: Yup.string().required("Please provide your name"),
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Email is required."),

  logo: Yup.mixed().nullable().optional(),
  about: Yup.string().optional(),
  address: Yup.string().optional(),

  phone: Yup.string().required("Phone number is required."),
  password: passwordValidationSchema,
});

export const ResetPasswordSchema = Yup.object({
  password: passwordValidationSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export const ForgotPasswordSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  otp: Yup.string()
    .matches(/^\d{6}$/, "Enter the 6-digit OTP")
    .optional(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one capital letter")
    .matches(/[a-z]/, "Password must contain at least one small letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    )
    .optional(),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .optional(),
});

export const Forgotpassword = ForgotPasswordSchema;

export const LoginFormSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address.")
    .required("Email address is required."),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters.")
    .required("Password is required."),
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
