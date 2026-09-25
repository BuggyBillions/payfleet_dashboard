import api from "../helpers/api";
import type { LoginValues, RegisterValues, sendEmailVerificationValues } from "../lib/interfaces";

export const createCompanyService = async (values: FormData | RegisterValues) => {
    const response = await api.post(`/register`, values, {
        headers: values instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
};

export const registerService = createCompanyService;

export const loginService = async (values: LoginValues) => {
    const response = await api.post(`/login`, values);
    return response.data;
};

export const getUserService = async () => {
    const response = await api.get(`/me`);
    return response.data?.data ?? response.data;
};

export const sendEmailVerificationCodeService = async (values: sendEmailVerificationValues) => {
    const response = await api.post(`/resend-otp`, values);
    return response.data;
};

export const forgotPasswordService = async (values: { email: string } | Record<string, unknown>) => {
    const response = await api.post(`/forgot-password`, values);
    return response.data;
};

export const verifyOtpService = async (values: { token?: string; reset_otp?: string | number; otp?: string | number }) => {
    const response = await api.post(`/verify-forgot-otp`, values);
    return response.data;
};

export const resetPasswordService = async (values: { token?: string; password?: string; confirmPassword?: string }) => {
    const response = await api.post(`/reset-password`, values);
    return response.data;
};

export interface ChangePasswordPayload {
    current_password?: string;
    password?: string;
    password_confirmation?: string;
    old_password?: string;
    new_password?: string;
    confirm_password?: string;
}

export const changePasswordService = async (payload: ChangePasswordPayload) => {
    const normalized = {
        current_password: payload.current_password || payload.old_password,
        password: payload.password || payload.new_password,
        password_confirmation: payload.password_confirmation || payload.confirm_password,
        old_password: payload.current_password || payload.old_password,
        new_password: payload.password || payload.new_password,
        confirm_password: payload.password_confirmation || payload.confirm_password,
    };

    try {
        const response = await api.post(`/change-password`, normalized);
        return response.data;
    } catch (error) {
        try {
            const response = await api.post(`/update-password`, normalized);
            return response.data;
        } catch {
            try {
                const response = await api.put(`/change-password`, normalized);
                return response.data;
            } catch {
                throw error;
            }
        }
    }
};