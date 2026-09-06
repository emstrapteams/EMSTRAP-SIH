import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Change this to your PC's IP
const API_URL =
    "https://emstrap-mobile-backend.onrender.com";
const API = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT
API.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("authToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;
export { API_URL };
