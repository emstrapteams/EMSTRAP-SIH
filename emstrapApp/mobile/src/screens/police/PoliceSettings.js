import React, { useState } from "react";

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import PoliceLayout from "../../components/police/PoliceLayout";

import {
    changePasswordAPI,
    getErrorMessage,
} from "../../services/api";

export default function PoliceSettings() {
    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const handleChangePassword = async () => {
        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            Alert.alert(
                "Missing Information",
                "Please fill in all password fields."
            );

            return;
        }

        if (newPassword.length < 8) {
            Alert.alert(
                "Invalid Password",
                "New password must be at least 8 characters."
            );

            return;
        }

        if (
            !/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            Alert.alert(
                "Invalid Password",
                "Password must include uppercase, lowercase, number and special character."
            );

            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(
                "Passwords Do Not Match",
                "Please make sure both new passwords match."
            );

            return;
        }

        try {
            setLoading(true);

            const res =
                await changePasswordAPI(
                    currentPassword,
                    newPassword
                );

            Alert.alert(
                "Success",
                res?.message ||
                "Password changed successfully."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            Alert.alert(
                "Unable to Change Password",
                getErrorMessage(
                    error,
                    "Failed to change password."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <PoliceLayout>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : undefined
                }
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={
                        styles.content
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                        false
                    }
                >
                    <Text style={styles.title}>
                        Settings
                    </Text>

                    <Text
                        style={styles.description}
                    >
                        Manage your account
                        preferences and security.
                    </Text>

                    <View style={styles.card}>
                        <View
                            style={
                                styles.securityHeader
                            }
                        >
                            <View
                                style={
                                    styles.iconContainer
                                }
                            >
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={27}
                                    color="#6b7280"
                                />
                            </View>

                            <View style={styles.flex}>
                                <Text
                                    style={
                                        styles.securityTitle
                                    }
                                >
                                    Security Settings
                                </Text>

                                <Text
                                    style={
                                        styles.securityDescription
                                    }
                                >
                                    Update the password
                                    used to sign in to
                                    your police account.
                                </Text>
                            </View>
                        </View>

                        <View
                            style={styles.divider}
                        />

                        <PasswordField
                            label="Current Password"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChangeText={
                                setCurrentPassword
                            }
                        />

                        <PasswordField
                            label="New Password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChangeText={
                                setNewPassword
                            }
                        />

                        <Text
                            style={
                                styles.passwordHint
                            }
                        >
                            Min 8 characters —
                            include uppercase,
                            lowercase, number and
                            special character.
                        </Text>

                        <PasswordField
                            label="Confirm New Password"
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChangeText={
                                setConfirmPassword
                            }
                        />

                        <TouchableOpacity
                            style={[
                                styles.button,
                                loading &&
                                styles.buttonDisabled,
                            ]}
                            activeOpacity={0.85}
                            disabled={loading}
                            onPress={
                                handleChangePassword
                            }
                        >
                            {loading ? (
                                <ActivityIndicator
                                    color="#ffffff"
                                />
                            ) : (
                                <Text
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    Change Password
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </PoliceLayout>
    );
}

function PasswordField({
    label,
    placeholder,
    value,
    onChangeText,
}) {
    const [visible, setVisible] =
        useState(false);

    return (
        <View style={styles.field}>
            <Text style={styles.label}>
                {label}
            </Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                        setVisible(
                            (previous) => !previous
                        )
                    }
                >
                    <Ionicons
                        name={
                            visible
                                ? "eye-off-outline"
                                : "eye-outline"
                        }
                        size={21}
                        color="#6b7280"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    content: {
        padding: 20,
        paddingBottom: 60,
    },

    title: {
        fontSize: 34,
        fontWeight: "800",
        color: "#111827",
    },

    description: {
        marginTop: 7,
        marginBottom: 28,
        fontSize: 16,
        lineHeight: 23,
        color: "#6b7280",
    },

    card: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 22,
        padding: 22,
    },

    securityHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconContainer: {
        width: 54,
        height: 54,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#f9fafb",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    securityTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    securityDescription: {
        marginTop: 5,
        fontSize: 14,
        lineHeight: 20,
        color: "#6b7280",
    },

    divider: {
        height: 1,
        backgroundColor: "#eeeeee",
        marginVertical: 24,
    },

    field: {
        marginBottom: 21,
    },

    label: {
        marginBottom: 9,
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: 58,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 15,
        backgroundColor: "#f9fafb",
    },

    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 15,
        fontSize: 16,
        color: "#111827",
    },

    eyeButton: {
        paddingHorizontal: 16,
        paddingVertical: 15,
    },

    passwordHint: {
        marginTop: -12,
        marginBottom: 22,
        fontSize: 13,
        lineHeight: 19,
        color: "#9ca3af",
    },

    button: {
        minHeight: 56,
        marginTop: 5,
        borderRadius: 14,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 25,
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    buttonText: {
        color: "#ffffff",
        fontSize: 17,
        fontWeight: "800",
    },
});