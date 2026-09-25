import { useMutation } from "@tanstack/react-query";
import {
  loginService,
  registerService,
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
} from "../services/authService";
import type { LoginValues, RegisterValues } from "../lib/interfaces";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

export const useAuth = () => {
  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) => registerService(values),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Registration failed"));
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => loginService(values),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Login failed"));
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (values: { email: string }) => forgotPasswordService(values),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to send reset code"));
    },
  });

  const OTPVerificationMutation = useMutation({
    mutationFn: (values: { token?: string; reset_otp?: string; otp?: string | number }) =>
      verifyOtpService(values),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Invalid verification code"));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (values: { token?: string; password?: string; confirmPassword?: string }) =>
      resetPasswordService(values),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reset password"));
    },
  });

  return {
    registerMutation,
    loginMutation,
    forgotPasswordMutation,
    OTPVerificationMutation,
    resetPasswordMutation,
  };
};