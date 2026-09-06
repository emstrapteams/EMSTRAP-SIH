import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import HospitalLayout from "../../components/hospital/HospitalLayout";

import {
    getAlerts,
    getHospitalById,
    getCurrentUser,
    updateEmergencyBeds,
} from "../../services/api";

import {
    connectHospitalSocket,
    getSocket,
    disconnectSocket,
} from "../../services/emergencyAPI";
const StatCard = ({
    title,
    value,
    icon,
    iconBackground,
    iconColor,
}) => {
    return (
        <View style={styles.statCard}>
            <View
                style={[
                    styles.statIcon,
                    {
                        backgroundColor:
                            iconBackground,
                    },
                ]}
            >
                <Ionicons
                    name={icon}
                    size={22}
                    color={iconColor}
                />
            </View>

            <View style={styles.statContent}>
                <Text style={styles.statTitle}>
                    {title}
                </Text>

                <Text style={styles.statValue}>
                    {value}
                </Text>
            </View>
        </View>
    );
};

export default function HospitalDashboard() {
    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [alerts, setAlerts] =
        useState([]);

    const [emergencyBeds, setEmergencyBeds] =
        useState(0);

    const [savingBeds, setSavingBeds] =
        useState(false);

    const loadEmergencyBeds = async () => {
        try {
            const meResponse =
                await getCurrentUser();

            console.log(
                "HOSPITAL /AUTH/ME:",
                meResponse
            );

            const user =
                meResponse?.user ||
                meResponse?.data ||
                meResponse;

            const hospitalId =
                user?._id || user?.id;

            if (!hospitalId) {
                console.log(
                    "HOSPITAL ID NOT FOUND:",
                    meResponse
                );
                return;
            }

            const res =
                await getHospitalById(
                    hospitalId
                );

            console.log(
                "HOSPITAL DETAILS RESPONSE:",
                res
            );

            if (res?.success && res?.hospital) {
                const savedBeds =
                    Number(
                        res.hospital.emergencyBeds
                    ) || 0;

                console.log(
                    "SAVED EMERGENCY BEDS:",
                    savedBeds
                );

                setEmergencyBeds(savedBeds);
            }
        } catch (error) {
            console.log(
                "LOAD HOSPITAL BEDS ERROR:",
                error?.response?.status,
                error?.response?.data ||
                error?.message
            );
        }
    };
    const loadDashboard = async (
        showLoader = true
    ) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            const alertsResponse =
                await getAlerts();


            if (alertsResponse?.success) {
                setAlerts(
                    alertsResponse.alerts || []
                );
            }
        } catch (error) {
            console.log(
                "HOSPITAL DASHBOARD ERROR:",
                error?.response?.data ||
                error?.message
            );
        } finally {
            if (showLoader) {
                setLoading(false);
            }

            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDashboard();
        loadEmergencyBeds();
    }, []);
    useEffect(() => {
        const connect = async () => {
            try {
                const meResponse = await getCurrentUser();

                const hospital =
                    meResponse?.user ||
                    meResponse?.data ||
                    meResponse;

                if (!hospital?._id) {
                    console.log("Hospital ID not found");
                    return;
                }

                connectHospitalSocket(hospital._id);
            } catch (err) {
                console.log("Socket Connection Error:", err);
            }
        };

        connect();

        return () => {
            disconnectSocket();
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadDashboard(false);
            loadEmergencyBeds();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadDashboard(false);
    };

    /*
     * Keep these based on the same emergency
     * statuses already used by EMSTRAP.
     */

    const totalBookings = alerts.length;

    const activeBookings = alerts.filter(
        (alert) =>
            !["COMPLETED", "CANCELLED"].includes(
                alert.status
            )
    ).length;

    const pendingBookings = alerts.filter(
        (alert) =>
            [
                "PENDING",
                "AMBULANCE_ACCEPTED",
                "ARRIVED_AT_LOCATION",
            ].includes(alert.status)
    ).length;

    const completedBookings = alerts.filter(
        (alert) =>
            alert.status === "COMPLETED"
    ).length;

    const cancelledBookings = alerts.filter(
        (alert) =>
            alert.status === "CANCELLED"
    ).length;

    const increaseBeds = () => {
        setEmergencyBeds((current) =>
            current + 1
        );
    };

    const decreaseBeds = () => {
        setEmergencyBeds((current) =>
            Math.max(0, current - 1)
        );
    };

    const saveEmergencyBeds = async () => {
        try {
            setSavingBeds(true);

            const response =
                await updateEmergencyBeds(
                    emergencyBeds
                );

            console.log(
                "HOSPITAL BED UPDATE:",
                response
            );

            Alert.alert(
                "Updated",
                "Emergency bed availability updated successfully."
            );
        } catch (error) {
            console.log(
                "HOSPITAL BED UPDATE ERROR:",
                error?.response?.data ||
                error?.message
            );

            Alert.alert(
                "Unable to update",
                error?.response?.data
                    ?.message ||
                "Could not update emergency beds."
            );
        } finally {
            setSavingBeds(false);
        }
    };

    if (loading) {
        return (
            <HospitalLayout
                title="Hospital Dashboard"
                description="Emergency response and hospital operations"
            >
                <View
                    style={
                        styles.loadingContainer
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color="#dc2626"
                    />

                    <Text
                        style={styles.loadingText}
                    >
                        Loading hospital
                        dashboard...
                    </Text>
                </View>
            </HospitalLayout>
        );
    }

    return (
        <HospitalLayout
            title="Hospital Dashboard"
            description="Emergency response and hospital operations"
            scroll={false}
        >


            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={
                            handleRefresh
                        }
                    />
                }
                contentContainerStyle={
                    styles.dashboardContent
                }
            >
                {/* Status */}
                <View style={styles.statusCard}>
                    <View
                        style={
                            styles.statusLeft
                        }
                    >
                        <View
                            style={
                                styles.statusIcon
                            }
                        >
                            <Ionicons
                                name="medical"
                                size={22}
                                color="#ffffff"
                            />
                        </View>

                        <View>
                            <Text
                                style={
                                    styles.statusTitle
                                }
                            >
                                Hospital Operations
                            </Text>

                            <Text
                                style={
                                    styles.statusSubtitle
                                }
                            >
                                Emergency response
                                system active
                            </Text>
                        </View>
                    </View>

                    <View
                        style={
                            styles.onlineBadge
                        }
                    >
                        <View
                            style={
                                styles.onlineDot
                            }
                        />

                        <Text
                            style={
                                styles.onlineText
                            }
                        >
                            ONLINE
                        </Text>
                    </View>
                </View>

                {/* Statistics */}
                <Text style={styles.sectionTitle}>
                    Overview
                </Text>

                <View style={styles.statsGrid}>
                    <StatCard
                        title="Total Bookings"
                        value={totalBookings}
                        icon="document-text-outline"
                        iconBackground="#eff6ff"
                        iconColor="#2563eb"
                    />

                    <StatCard
                        title="Active"
                        value={activeBookings}
                        icon="pulse-outline"
                        iconBackground="#fff7ed"
                        iconColor="#ea580c"
                    />

                    <StatCard
                        title="Pending"
                        value={pendingBookings}
                        icon="time-outline"
                        iconBackground="#fefce8"
                        iconColor="#ca8a04"
                    />

                    <StatCard
                        title="Completed"
                        value={
                            completedBookings
                        }
                        icon="checkmark-circle-outline"
                        iconBackground="#f0fdf4"
                        iconColor="#16a34a"
                    />

                    <StatCard
                        title="Cancelled"
                        value={
                            cancelledBookings
                        }
                        icon="close-circle-outline"
                        iconBackground="#fef2f2"
                        iconColor="#dc2626"
                    />
                </View>

                {/* Emergency beds */}
                <Text style={styles.sectionTitle}>
                    Emergency Bed Availability
                </Text>

                <View style={styles.bedCard}>
                    <View style={styles.bedHeader}>
                        <View
                            style={
                                styles.bedIcon
                            }
                        >
                            <Ionicons
                                name="bed-outline"
                                size={24}
                                color="#dc2626"
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text
                                style={
                                    styles.bedTitle
                                }
                            >
                                Available Emergency
                                Beds
                            </Text>

                            <Text
                                style={
                                    styles.bedDescription
                                }
                            >
                                Keep availability
                                updated for ambulance
                                assignment.
                            </Text>
                        </View>
                    </View>

                    <View
                        style={
                            styles.bedControls
                        }
                    >
                        <TouchableOpacity
                            style={
                                styles.counterButton
                            }
                            onPress={decreaseBeds}
                        >
                            <Ionicons
                                name="remove"
                                size={25}
                                color="#374151"
                            />
                        </TouchableOpacity>

                        <View
                            style={
                                styles.bedNumberContainer
                            }
                        >
                            <Text
                                style={
                                    styles.bedNumber
                                }
                            >
                                {emergencyBeds}
                            </Text>

                            <Text
                                style={
                                    styles.bedNumberLabel
                                }
                            >
                                beds
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={
                                styles.counterButton
                            }
                            onPress={increaseBeds}
                        >
                            <Ionicons
                                name="add"
                                size={25}
                                color="#374151"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            savingBeds &&
                            styles.saveButtonDisabled,
                        ]}
                        onPress={
                            saveEmergencyBeds
                        }
                        disabled={savingBeds}
                    >
                        {savingBeds ? (
                            <ActivityIndicator
                                color="#ffffff"
                            />
                        ) : (
                            <>
                                <Ionicons
                                    name="save-outline"
                                    size={19}
                                    color="#ffffff"
                                />

                                <Text
                                    style={
                                        styles.saveButtonText
                                    }
                                >
                                    Update
                                    Availability
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </HospitalLayout>
    );
}

const styles = StyleSheet.create({
    dashboardContent: {
        paddingBottom: 40,
    },

    loadingContainer: {
        flex: 1,
        minHeight: 400,

        alignItems: "center",
        justifyContent: "center",
    },

    loadingText: {
        marginTop: 12,

        fontSize: 14,
        color: "#6b7280",
    },

    statusCard: {
        backgroundColor: "#ffffff",

        borderRadius: 16,
        padding: 16,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        marginBottom: 24,
    },

    statusLeft: {
        flex: 1,

        flexDirection: "row",
        alignItems: "center",
    },

    statusIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,

        backgroundColor: "#dc2626",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 12,
    },

    statusTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },

    statusSubtitle: {
        marginTop: 3,

        fontSize: 11,
        color: "#6b7280",
    },

    onlineBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#f0fdf4",

        paddingHorizontal: 9,
        paddingVertical: 6,

        borderRadius: 20,
    },

    onlineDot: {
        width: 7,
        height: 7,
        borderRadius: 4,

        backgroundColor: "#16a34a",

        marginRight: 5,
    },

    onlineText: {
        fontSize: 9,
        fontWeight: "800",
        color: "#15803d",
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#111827",

        marginBottom: 12,
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",

        justifyContent: "space-between",

        marginBottom: 26,
    },

    statCard: {
        width: "48.5%",

        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 15,

        padding: 14,

        marginBottom: 10,

        flexDirection: "row",
        alignItems: "center",
    },

    statIcon: {
        width: 40,
        height: 40,

        borderRadius: 11,

        alignItems: "center",
        justifyContent: "center",

        marginRight: 10,
    },

    statContent: {
        flex: 1,
    },

    statTitle: {
        fontSize: 10,
        fontWeight: "600",
        color: "#6b7280",
    },

    statValue: {
        marginTop: 2,

        fontSize: 21,
        fontWeight: "800",
        color: "#111827",
    },

    bedCard: {
        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 18,

        padding: 18,
    },

    bedHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    bedIcon: {
        width: 46,
        height: 46,

        borderRadius: 13,

        backgroundColor: "#fef2f2",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 12,
    },

    bedTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
    },

    bedDescription: {
        marginTop: 4,

        fontSize: 11,
        lineHeight: 16,

        color: "#6b7280",
    },

    bedControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        marginVertical: 24,
    },

    counterButton: {
        width: 48,
        height: 48,

        borderRadius: 14,

        backgroundColor: "#f3f4f6",

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    bedNumberContainer: {
        minWidth: 100,

        alignItems: "center",
        justifyContent: "center",
    },

    bedNumber: {
        fontSize: 34,
        fontWeight: "900",
        color: "#111827",
    },

    bedNumberLabel: {
        marginTop: -3,

        fontSize: 10,
        fontWeight: "600",
        color: "#9ca3af",
    },

    saveButton: {
        minHeight: 50,

        borderRadius: 13,

        backgroundColor: "#dc2626",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: 8,
    },

    saveButtonDisabled: {
        opacity: 0.6,
    },

    saveButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "800",
    },
    notificationCard: {
        backgroundColor: "#dc2626",
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
    },

    notificationHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    notificationTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "800",
        marginLeft: 10,
    },

    notificationMessage: {
        color: "#fff",
        marginTop: 10,
        fontSize: 14,
    },

    dismissButton: {
        alignSelf: "flex-end",
        marginTop: 14,
    },

    dismissText: {
        color: "#fff",
        fontWeight: "700",
    },
});