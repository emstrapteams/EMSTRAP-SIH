import API from "../config/api";

export const login = async (email, password) => {
    const res = await API.post("/auth/login", {
        email,
        password,
    });

    return res.data;
};

export const register = async (data) => {
    const res = await API.post("/auth/register", data);

    return res.data;
};

export const logout = async () => {
    const res = await API.post("/auth/logout");

    return res.data;
};

export const forgotPassword = async (email) => {
    const res = await API.post(
        "/auth/forgot-password",
        {
            email,
            platform: "mobile",
        }
    );

    return res.data;
};
