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
    ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { register } from "../../services/auth.service";

// Same validation rules used by the web app (frontend/src/pages/auth/Register.jsx
// and backend/src/controllers/auth.controller.js registerUser)
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const STRONG_PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterScreen() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        mobile: "",
        password: "",
        city: "",
        address: "",
        role: "user",
        vehicleNumber: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleRegister = async () => {
        if (!form.name || !form.email || !form.password) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (!MOBILE_REGEX.test(form.mobile)) {
            Alert.alert("Error", "Please enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (!STRONG_PASSWORD_REGEX.test(form.password)) {
            Alert.alert(
                "Error",
                "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (e.g., @, $, !)."
            );
            return;
        }

        if (form.role === "ambulance_driver" && !form.vehicleNumber) {
            Alert.alert("Error", "Vehicle number is required for ambulance driver registration.");
            return;
        }

        try {
            setLoading(true);
            await register(form);
            setSuccess(true);
        } catch (err) {
            Alert.alert(
                "Registration Failed",
                err?.response?.data?.message || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successBox}>
                    <Ionicons name="checkmark-circle" size={90} color="#16a34a" />
                    <Text style={styles.successTitle}>Email Sent!</Text>
                    <Text style={styles.successText}>
                        We've sent a verification link to your email. Please check your inbox and
                        verify your email address to continue.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace("/login")}
                    >
                        <Text style={styles.buttonText}>Go to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>Create Account</Text>

                <TextInput
                    placeholder="Full Name"
                    style={styles.input}
                    value={form.name}
                    onChangeText={(v) => update("name", v)}
                />

                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={(v) => update("email", v)}
                />

                <View style={styles.mobileBox}>
                    <Text style={styles.mobilePrefix}>+91</Text>
                    <TextInput
                        placeholder="Mobile Number"
                        style={styles.mobileInput}
                        keyboardType="number-pad"
                        maxLength={10}
                        value={form.mobile}
                        onChangeText={(v) => update("mobile", v.replace(/\D/g, ""))}
                    />
                </View>

                <View style={styles.passwordBox}>
                    <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.passwordInput}
                        value={form.password}
                        onChangeText={(v) => update("password", v)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color="#888"
                        />
                    </TouchableOpacity>
                </View>

                <TextInput
                    placeholder="City"
                    style={styles.input}
                    value={form.city}
                    onChangeText={(v) => update("city", v)}
                />

                <TextInput
                    placeholder="Address"
                    style={styles.input}
                    value={form.address}
                    onChangeText={(v) => update("address", v)}
                />

                <Text style={styles.roleLabel}>Register as</Text>
                <View style={styles.roleRow}>
                    <TouchableOpacity
                        style={[
                            styles.roleOption,
                            form.role === "user" && styles.roleOptionActive,
                        ]}
                        onPress={() => update("role", "user")}
                    >
                        <Text
                            style={[
                                styles.roleOptionText,
                                form.role === "user" && styles.roleOptionTextActive,
                            ]}
                        >
                            User
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.roleOption,
                            form.role === "ambulance_driver" && styles.roleOptionActive,
                        ]}
                        onPress={() => update("role", "ambulance_driver")}
                    >
                        <Text
                            style={[
                                styles.roleOptionText,
                                form.role === "ambulance_driver" && styles.roleOptionTextActive,
                            ]}
                        >
                            Ambulance Driver
                        </Text>
                    </TouchableOpacity>
                </View>

                {form.role === "ambulance_driver" && (
                    <TextInput
                        placeholder="Vehicle Number (e.g. MH-12-AB-3456)"
                        style={styles.input}
                        autoCapitalize="characters"
                        value={form.vehicleNumber}
                        onChangeText={(v) => update("vehicleNumber", v)}
                    />
                )}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text style={styles.loginLink}>
                        Already have an account?
                        <Text style={{ color: "#dc2626" }}> Login</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    scrollContent: {
        paddingHorizontal: 28,
        paddingVertical: 24,
    },

    logo: {
        width: 180,
        height: 90,
        alignSelf: "center",
        marginBottom: 10,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 22,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        paddingHorizontal: 18,
        height: 55,
        marginBottom: 16,
        fontSize: 16,
    },

    mobileBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        marginBottom: 16,
        overflow: "hidden",
    },

    mobilePrefix: {
        paddingHorizontal: 16,
        height: 55,
        textAlignVertical: "center",
        fontWeight: "700",
        color: "#374151",
        backgroundColor: "#f3f4f6",
        lineHeight: 55,
    },

    mobileInput: {
        flex: 1,
        height: 55,
        paddingHorizontal: 16,
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
        marginBottom: 16,
    },

    passwordInput: {
        flex: 1,
        fontSize: 16,
    },

    roleLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },

    roleRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 16,
    },

    roleOption: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: "center",
    },

    roleOptionActive: {
        borderColor: "#dc2626",
        backgroundColor: "#fef2f2",
    },

    roleOptionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },

    roleOptionTextActive: {
        color: "#dc2626",
    },

    button: {
        backgroundColor: "#dc2626",
        height: 55,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 6,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 17,
    },

    loginLink: {
        textAlign: "center",
        marginTop: 22,
        fontSize: 15,
        color: "#555",
    },

    successBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    successTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 18,
        marginBottom: 10,
    },

    successText: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 30,
    },
});
