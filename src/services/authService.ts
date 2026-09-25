import api from "../helpers/api";
import type { LoginValues, RegisterValues, sendEmailVerificationValues } from "../lib/interfaces";

export const createCompanyService = async (values: FormData | RegisterValues) => {
    const response = await api.post(`/createcompanies`, values, {
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

export const forgotPasswordService = async (values: { email: string }) => {
    const response = await api.post(`/forgotpassword`, values);
    return response.data;
};

export const verifyOtpService = async (values: { token?: string; reset_otp?: string; otp?: string | number }) => {
    const response = await api.post(`/verify-otp`, values);
    return response.data;
};

export const resetPasswordService = async (values: { token?: string; password?: string; confirmPassword?: string }) => {
    const response = await api.post(`/reset-password`, values);
    return response.data;
};