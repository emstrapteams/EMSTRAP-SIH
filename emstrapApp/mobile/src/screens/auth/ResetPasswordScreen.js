import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import API from "../../config/api";

export default function ResetPasswordScreen() {

    const router = useRouter();
    const { token } = useLocalSearchParams();

    const resetToken = Array.isArray(token) ? token[0] : token;
    console.log("🔐 RESET TOKEN RECEIVED:", resetToken);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {

        if (!password || !confirmPassword) {
            Alert.alert(
                "Error",
                "Please enter both passwords."
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(
                "Error",
                "Passwords do not match."
            );
            return;
        }

        try {

            setLoading(true);

            await API.put(
                `/auth/reset-password/${resetToken}`,
                {
                    password,
                }
            );

            Alert.alert(
                "Password Reset",
                "Your password has been reset successfully.",
                [
                    {
                        text: "Login",
                        onPress: () =>
                            router.replace("/login"),
                    },
                ]
            );

        } catch (error) {

            console.log(
                "RESET PASSWORD ERROR:",
                error.response?.data ||
                error.message
            );

            Alert.alert(
                "Reset Failed",
                error.response?.data?.message ||
                "The reset link is invalid or expired."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                Reset Password
            </Text>

            <Text style={styles.subtitle}>
                Enter your new password below.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
            >

                {loading ? (

                    <ActivityIndicator color="#FFFFFF" />

                ) : (

                    <Text style={styles.buttonText}>
                        Reset Password
                    </Text>

                )}

            </TouchableOpacity>

        </View>

    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#F8FAFC",
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 15,
        color: "#6B7280",
        marginBottom: 24,
    },

    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        marginBottom: 14,
        fontSize: 16,
    },

    button: {
        backgroundColor: "#DC2626",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
        marginTop: 8,
    },

    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

});