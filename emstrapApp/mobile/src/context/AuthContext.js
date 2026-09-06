import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../config/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        restoreSession();
    }, []);

    const restoreSession = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            if (!token) {
                setLoading(false);
                return;
            }

            const res = await API.get("/auth/me");

            setUser(res.data.user || res.data);
        } catch (err) {
            await AsyncStorage.removeItem("authToken");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const loginUser = async (data) => {
        if (data?.token) {
            await AsyncStorage.setItem("authToken", data.token);
        }

        const userData = data.user || data;

        await AsyncStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    };

    const logoutUser = async () => {
        await AsyncStorage.multiRemove([
            "authToken",
            "user",
        ]);

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}