import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";

import HospitalLayout from "../../components/hospital/HospitalLayout";
import * as Location from "expo-location";
import {
    getCurrentUser,
    getHospitalById,
    updateHospitalProfile,
    changePasswordAPI,
} from "../../services/api";

export default function HospitalSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [passwordLoading, setPasswordLoading] =
        useState(false);

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        mobile: "",
        address: "",
        city: "",
        emergencyBeds: "",
        latitude: "",
        longitude: "",
    });

    const [passwords, setPasswords] =
        useState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);

            const hospital = await getCurrentUser();

            setProfile({
                name: hospital.name || "",
                email: hospital.email || "",
                mobile: hospital.mobile || "",
                address: hospital.address || "",
                city: hospital.city || "",
                emergencyBeds: String(hospital.emergencyBeds || 0),
                latitude: String(hospital.location?.latitude ?? ""),
                longitude: String(hospital.location?.longitude ?? ""),
            });
        } catch (err) {
            Alert.alert(
                "Error",
                err.response?.data?.message ||
                "Unable to load profile."
            );
        } finally {
            setLoading(false);
        }
    };
    const handleProfileChange = (
        field,
        value
    ) => {
        setProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handlePasswordChange = (
        field,
        value
    ) => {
        setPasswords((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const saveProfile = async () => {
        try {
            setSaving(true);

            await updateHospitalProfile({
                name: profile.name,
                email: profile.email,
                mobile: profile.mobile,
                address: profile.address,
                city: profile.city,
                emergencyBeds: Number(profile.emergencyBeds),

                location: {
                    latitude: Number(profile.latitude),
                    longitude: Number(profile.longitude),
                },
            });

            Alert.alert(
                "Success",
                "Hospital profile updated successfully."
            );

            loadProfile();
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data
                    ?.message ||
                "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const useCurrentLocation = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Location permission is required."
                );
                return;
            }

            const location =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            const reverse =
                await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

            if (reverse.length > 0) {
                const place = reverse[0];

                setProfile((prev) => ({
                    ...prev,

                    latitude:
                        location.coords.latitude.toFixed(6),

                    longitude:
                        location.coords.longitude.toFixed(6),

                    city:
                        place.city ||
                        place.subregion ||
                        "",

                    address:
                        [
                            place.name,
                            place.street,
                            place.district,
                        ]
                            .filter(Boolean)
                            .join(", "),
                }));
            }

            Alert.alert(
                "Success",
                "Current location updated."
            );

        } catch (err) {
            console.log(err);

            Alert.alert(
                "Error",
                "Unable to fetch current location."
            );
        }
    };

    const changePassword = async () => {
        if (
            passwords.newPassword !==
            passwords.confirmPassword
        ) {
            Alert.alert(
                "Error",
                "Passwords do not match."
            );
            return;
        }

        try {
            setPasswordLoading(true);

            await changePasswordAPI(
                passwords.currentPassword,
                passwords.newPassword
            );

            Alert.alert(
                "Success",
                "Password updated successfully."
            );

            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            Alert.alert(
                "Error",
                err?.response?.data
                    ?.message ||
                "Failed to update password."
            );
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <HospitalLayout
                title="Settings"
                description="Manage your hospital account."
            >
                <ActivityIndicator
                    size="large"
                    color="#dc2626"
                    style={{
                        marginTop: 50,
                    }}
                />
            </HospitalLayout>
        );
    }
    return (
        <HospitalLayout
            title="Settings"
            description="Manage your hospital profile and security."
        >
            {/* Hospital Information */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    Hospital Information
                </Text>

                <Text style={styles.cardSubtitle}>
                    Update your hospital details.
                </Text>

                <Text style={styles.label}>
                    Hospital Name
                </Text>

                <TextInput
                    style={styles.input}
                    value={profile.name}
                    onChangeText={(text) =>
                        handleProfileChange(
                            "name",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    Email
                </Text>

                <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={profile.email}
                    onChangeText={(text) =>
                        handleProfileChange(
                            "email",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    Mobile
                </Text>

                <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={profile.mobile}
                    onChangeText={(text) =>
                        handleProfileChange(
                            "mobile",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    Address
                </Text>

                <TextInput
                    style={[
                        styles.input,
                        styles.multiline,
                    ]}
                    multiline
                    value={profile.address}
                    onChangeText={(text) =>
                        handleProfileChange(
                            "address",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    City
                </Text>

                <TextInput
                    style={styles.input}
                    value={profile.city}
                    onChangeText={(text) =>
                        handleProfileChange(
                            "city",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    Emergency Beds
                </Text>

                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={profile.emergencyBeds}
                    onChangeText={(text) =>
                        handleProfileChange(
                            "emergencyBeds",
                            text
                        )
                    }
                />
                <Text style={styles.label}>Latitude</Text>

                <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={profile.latitude}
                    onChangeText={(text) =>
                        handleProfileChange("latitude", text)
                    }
                />

                <Text style={styles.label}>Longitude</Text>

                <TextInput
                    style={styles.input}
                    keyboardType="decimal-pad"
                    value={profile.longitude}
                    onChangeText={(text) =>
                        handleProfileChange("longitude", text)
                    }
                />
                <TouchableOpacity
                    style={styles.locationButton}
                    onPress={useCurrentLocation}
                >
                    <Text style={styles.locationButtonText}>
                        Use Current Location
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveProfile}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving
                            ? "Saving..."
                            : "Save Changes"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Security */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    Security Settings
                </Text>

                <Text style={styles.cardSubtitle}>
                    Change your password.
                </Text>

                <Text style={styles.label}>
                    Current Password
                </Text>

                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={
                        passwords.currentPassword
                    }
                    onChangeText={(text) =>
                        handlePasswordChange(
                            "currentPassword",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    New Password
                </Text>

                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={
                        passwords.newPassword
                    }
                    onChangeText={(text) =>
                        handlePasswordChange(
                            "newPassword",
                            text
                        )
                    }
                />

                <Text style={styles.label}>
                    Confirm Password
                </Text>

                <TextInput
                    style={styles.input}
                    secureTextEntry
                    value={
                        passwords.confirmPassword
                    }
                    onChangeText={(text) =>
                        handlePasswordChange(
                            "confirmPassword",
                            text
                        )
                    }
                />

                <TouchableOpacity
                    style={styles.passwordButton}
                    onPress={changePassword}
                    disabled={passwordLoading}
                >
                    <Text
                        style={
                            styles.passwordButtonText
                        }
                    >
                        {passwordLoading
                            ? "Updating..."
                            : "Change Password"}
                    </Text>
                </TouchableOpacity>
            </View>
        </HospitalLayout>
    );
}
const styles = StyleSheet.create({
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 4,
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    cardSubtitle: {
        marginTop: 5,
        marginBottom: 18,

        fontSize: 14,
        color: "#6b7280",
    },

    label: {
        marginBottom: 6,
        marginTop: 12,

        fontSize: 14,
        fontWeight: "700",

        color: "#374151",
    },

    input: {
        height: 50,

        borderWidth: 1,
        borderColor: "#d1d5db",

        borderRadius: 12,

        paddingHorizontal: 14,

        backgroundColor: "#ffffff",

        fontSize: 15,

        color: "#111827",
    },

    multiline: {
        height: 90,
        paddingTop: 14,
        textAlignVertical: "top",
    },

    saveButton: {
        marginTop: 24,

        height: 52,

        borderRadius: 12,

        backgroundColor: "#dc2626",

        alignItems: "center",
        justifyContent: "center",
    },

    saveButtonText: {
        color: "#ffffff",

        fontSize: 16,
        fontWeight: "700",
    },

    passwordButton: {
        marginTop: 24,

        height: 52,

        borderRadius: 12,

        backgroundColor: "#2563eb",

        alignItems: "center",
        justifyContent: "center",
    },

    passwordButtonText: {
        color: "#ffffff",

        fontSize: 16,
        fontWeight: "700",
    },
    locationButton: {
        marginTop: 16,
        marginBottom: 8,

        height: 48,

        borderRadius: 12,

        backgroundColor: "#16a34a",

        justifyContent: "center",
        alignItems: "center",
    },

    locationButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "700",
    },
});