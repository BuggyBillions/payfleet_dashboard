import api from "../helpers/api";
import type { LoginValues, RegisterValues } from "../lib/interfaces";

export const registerService = async (values: RegisterValues) => {
    const response = await api.post(`/api/auth/register`, values);
    return response.data;
};

export const loginService = async (values: LoginValues) => {
    const response = await api.post(`/api/auth/login`, values);
    return response.data;
};

export const getUserService = async () => {
    const response = await api.get(`/api/auth/me`);
    return response.data;
};