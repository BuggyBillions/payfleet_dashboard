import { useMutation } from "@tanstack/react-query"
import { loginService, registerService } from "../services/authService"
import { toast } from "sonner";
import { getErrorMessage } from "../helpers/api";

export const useAuth = () => {
    const registerMutation = useMutation({
        mutationFn: registerService,
        onSuccess: () => {},
        onError: (error: unknown) => {
            console.error("Register failed:", error);
            toast.error(getErrorMessage(error))
        },
    });

    const loginMutation = useMutation({
        mutationFn: loginService,
        onSuccess: () => {},
        onError: (error: unknown) => {
            console.error("Login failed:", error);
            toast.error(getErrorMessage(error))
        },
    });


    return {
        registerMutation,
        loginMutation,
    }
}