import { useMutation } from "@tanstack/react-query";
import { loginService, registerService } from "../services/authService";
import type { LoginValues, RegisterValues } from "../lib/interfaces";

export const useAuth = () => {
  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) => registerService(values),
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) => loginService(values),
  });

  return {
    registerMutation,
    loginMutation,
  };
};