import api from "../helpers/api";
import type { LoginValues, RegisterValues, sendEmailVerificationValues } from "../lib/interfaces";

export const registerService = async (values: RegisterValues) => {
    const response = await api.post(`/api/auth/register`, values);
    return response.data;
};

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
}