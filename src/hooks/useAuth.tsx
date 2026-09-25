import { useMutation } from "@tanstack/react-query";
import {
  forgotPasswordService,
  loginService,
  verifyOtpService,
  registerService,
  resetPasswordService,
} from "../services/authService";
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";
import type {
  ForgotPasswordFormValues,
  OTPVerifyValues,
  ResetPasswordValues,
} from "../lib/interfaces";
import { useUser } from "./useUser";

export const useAuth = () => {
  const { saveVerificationToken } = useUser();

  const registerMutation = useMutation({
    mutationFn: registerService,
    onError: (error: unknown) => {
      console.error("Register failed:", error);
      toast.error(getErrorMessage(error));
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: () => {},
    onError: (error: unknown) => {
      console.error("Login failed:", error);
      toast.error(getErrorMessage(error));
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) => forgotPasswordService(data),
    onSuccess: (data) => {
      toast.success(data.message ?? "Reset code sent successfully");
      saveVerificationToken(data.data.token);
    },
    onError: (error: unknown) => {
      console.error("Failed to forget password:", error);
      toast.error(getErrorMessage(error));
    },
  });

  const OTPVerificationMutation = useMutation({
    mutationFn: (data: OTPVerifyValues) => verifyOtpService(data),
    onSuccess: (data) => {
      toast.success(data.message ?? "OTP verified successfully");
    },
    onError: (error: unknown) => {
      console.error("Failed to verify otp:", error);
      toast.error(getErrorMessage(error));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordValues) => resetPasswordService(data),
    onSuccess: (data) => {
      toast.success(data.message ?? "Password reset successfully");
    },
    onError: (error: unknown) => {
      console.error("Failed to reset password:", error);
      toast.error(getErrorMessage(error));
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
