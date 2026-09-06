import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { forgotPassword } from "../../services/auth.service";

export default function ForgotPasswordScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        try {
            setLoading(true);
            await forgotPassword(email.trim().toLowerCase());
            setSuccess(true);
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data?.message || "Failed to send reset email. Please try again."
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
                        We've sent a password reset link to{" "}
                        <Text style={{ fontWeight: "700", color: "#111827" }}>{email}</Text>.
                        Please check your inbox and spam folder, then open the link to set a new
                        password.
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.replace("/login")}
                    >
                        <Text style={styles.buttonText}>Return to Login</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email address to receive a secure password reset link.
                </Text>

                <TextInput
                    placeholder="name@email.com"
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoFocus
                />

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleForgotPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Send Reset Link</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text style={styles.loginLink}>
                        Remember your password?
                        <Text style={{ color: "#dc2626" }}> Log in</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 10,
    },

    subtitle: {
        textAlign: "center",
        color: "#6b7280",
        fontSize: 15,
        marginBottom: 26,
        lineHeight: 21,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 14,
        paddingHorizontal: 18,
        height: 55,
        marginBottom: 22,
        fontSize: 16,
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
