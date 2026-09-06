import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
    const router = useRouter();
    const { loginUser } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        try {
            setLoading(true);

            const data = await login(
                email.trim().toLowerCase(),
                password
            );

            await loginUser(data);

            const role = data.user?.role || data.role;

            switch (role) {

                case "admin":
                    router.replace("/admin");
                    break;

                case "hospital":
                case "hospital_admin":
                    router.replace("/hospital");
                    break;

                case "police":
                case "police_hq":
                    router.replace("/police");
                    break;

                case "ambulance_driver":
                    router.replace("/driver");
                    break;

                case "private_driver":
                    router.replace("/privateDriver");
                    break;

                case "user":
                    router.replace("/user/booking");
                    break;

                default:
                    router.replace("/");
            }
        } catch (err) {
            Alert.alert(
                "Login Failed",
                err?.response?.data?.message || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />

            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
                placeholder="Email"
                style={styles.input}
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <View style={styles.passwordBox}>
                <TextInput
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    onPress={() =>
                        setShowPassword(!showPassword)
                    }
                >
                    <Ionicons
                        name={
                            showPassword
                                ? "eye-off-outline"
                                : "eye-outline"
                        }
                        size={22}
                        color="#888"
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() =>
                    router.push("/forgot-password")
                }
            >
                <Text style={styles.forgot}>
                    Forgot Password?
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        Login
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    router.push("/register")
                }
            >
                <Text style={styles.register}>
                    Don't have an account?
                    <Text style={{ color: "#dc2626" }}>
                        {" "}
                        Register
                    </Text>
                </Text>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    logo: {
        width: 260,
        height: 120,
        alignSelf: "center",
        marginBottom: 25,
    },

    title: {
        fontSize: 30,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 30,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        paddingHorizontal: 18,
        height: 55,
        marginBottom: 18,
        fontSize: 16,
    },

    passwordBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        paddingHorizontal: 18,
        height: 55,
    },

    passwordInput: {
        flex: 1,
        fontSize: 16,
    },

    forgot: {
        alignSelf: "flex-end",
        color: "#dc2626",
        marginTop: 12,
        marginBottom: 25,
        fontWeight: "600",
    },

    button: {
        backgroundColor: "#dc2626",
        height: 55,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 17,
    },

    register: {
        textAlign: "center",
        marginTop: 28,
        fontSize: 15,
        color: "#555",
    },
});