import api from "../helpers/api";
import type {
  ForgottenPasswordValues,
  LoginValues,
  OTPVerifyValues,
  RegisterValues,
  ResetPasswordValues,
} from "../lib/interfaces";

export const registerService = async (values: RegisterValues) => {
  const response = await api.post(`/auth/register`, values);
  return response.data;
};

export const loginService = async (values: LoginValues) => {
  const response = await api.post(`/auth/login`, values);
  return response.data;
};

export const getUserService = async () => {
  const response = await api.get(`/auth/me`);
  return response.data;
};

export const forgotPasswordService = async (data: ForgottenPasswordValues) => {
  const response = await api.post(`/forgot-password`, data);
  return response.data;
};

export const OTPVerificationService = async (data: OTPVerifyValues) => {
  const response = await api.post(`/verify-forgot-otp`, data);
  return response.data;
};

export const ResetPasswordService = async (data: ResetPasswordValues) => {
  const response = await api.post(`/reset-password`, data);
  return response.data;
};
