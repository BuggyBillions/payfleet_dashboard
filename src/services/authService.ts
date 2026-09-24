import api from "../helpers/api"

interface LoginValues {
    email: string;
    password: string;
}

interface RegisterValues {
    name: string;
    email: string;
    password: string;
    phone: string;
}

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