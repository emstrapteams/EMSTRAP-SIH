import API from "../config/api";

export const loginAPI = async (email, password) => {
    const response = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
    });

    return response.data;
};

export const registerAPI = async (data) => {
    const response = await API.post("/auth/register", data);

    return response.data;
};