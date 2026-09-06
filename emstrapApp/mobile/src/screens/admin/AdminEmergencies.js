import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
    TouchableOpacity,
    ScrollView,
} from "react-native";

import AdminLayout from "../../components/admin/AdminLayout";
import EmergencyCard from "../../components/admin/EmergencyCard";
import API from "../../config/api";

const FILTERS = [
    {
        key: "ALL",
        label: "Total",
    },
    {
        key: "PENDING",
        label: "Pending",
    },
    {
        key: "ACTIVE",
        label: "Active",
    },
    {
        key: "RESOLVED",
        label: "Resolved",
    },
    {
        key: "CANCELLED",
        label: "Cancelled",
    },
];

const matchesFilter = (emergency, filter) => {
    const status = (
        emergency.status || ""
    ).toUpperCase();

    switch (filter) {
        case "PENDING":
            return status === "PENDING";

        case "ACTIVE":
            return [
                "AMBULANCE_ACCEPTED",
                "ARRIVED_AT_LOCATION",
                "EN_ROUTE_TO_HOSPITAL",
            ].includes(status);

        case "RESOLVED":
            return [
                "COMPLETED",
                "RESOLVED",
            ].includes(status);

        case "CANCELLED":
            return status === "CANCELLED";

        default:
            return true;
    }
};

export default function AdminEmergencies() {
    const [emergencies, setEmergencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [activeFilter, setActiveFilter] =
        useState("ALL");

    // --------------------------------------------------
    // FETCH
    // --------------------------------------------------

    const fetchEmergencies = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const res = await API.get(
                "/api/admin/emergencies"
            );

            const data = res.data;

            const emergencyList =
                data?.emergencies ||
                data?.requests ||
                data?.data ||
                (Array.isArray(data) ? data : []);

            setEmergencies(emergencyList);
        } catch (err) {
            console.log(
                "EMERGENCY FETCH ERROR:",
                err?.response?.data || err.message
            );

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to load emergencies."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEmergencies();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchEmergencies(true);
    };

    // --------------------------------------------------
    // FILTER
    // --------------------------------------------------

    const visibleEmergencies = useMemo(() => {
        return emergencies.filter((emergency) =>
            matchesFilter(
                emergency,
                activeFilter
            )
        );
    }, [emergencies, activeFilter]);

    const getCount = (filter) => {
        return emergencies.filter((emergency) =>
            matchesFilter(emergency, filter)
        ).length;
    };

    // --------------------------------------------------
    // VIEW DETAILS
    // --------------------------------------------------

    const handleView = (emergency) => {
        const patient =
            emergency.user?.name ||
            "Anonymous / System";

        const email =
            emergency.user?.email ||
            "N/A";

        const mobile =
            emergency.user?.mobile ||
            "N/A";

        const city =
            emergency.user?.city ||
            "N/A";

        const driver =
            emergency.ambulance?.driverName ||
            emergency.ambulance?.name ||
            "Awaiting Response";

        const driverContact =
            emergency.ambulance?.contact ||
            emergency.ambulance?.mobile ||
            "N/A";

        const vehicle =
            emergency.ambulance
                ?.vehicleNumber || "N/A";

        const hospital =
            emergency.hospital?.name ||
            "Not Assigned";

        const latitude =
            emergency.location?.latitude;

        const longitude =
            emergency.location?.longitude;

        Alert.alert(
            "Emergency Details",
            `Status: ${emergency.status || "UNKNOWN"}

Patient: ${patient}

Email: ${email}

Mobile: ${mobile}

City: ${city}

Driver: ${driver}

Driver Contact: ${driverContact}

Vehicle: ${vehicle}

Hospital: ${hospital}

Coordinates: ${latitude != null &&
                longitude != null
                ? `${latitude}, ${longitude}`
                : "N/A"
            }`
        );
    };

    // --------------------------------------------------
    // DELETE
    // --------------------------------------------------

    const handleDelete = (emergency) => {
        Alert.alert(
            "Delete Emergency",
            "Are you sure you want to delete this emergency record?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                        confirmDelete(
                            emergency._id
                        ),
                },
            ]
        );
    };

    const confirmDelete = async (id) => {
        try {
            await API.delete(
                `/api/admin/emergencies/${id}`
            );

            setEmergencies((prev) =>
                prev.filter(
                    (emergency) =>
                        emergency._id !== id
                )
            );

            Alert.alert(
                "Deleted",
                "Emergency deleted successfully."
            );
        } catch (err) {
            console.log(
                "DELETE EMERGENCY ERROR:",
                err?.response?.data ||
                err.message
            );

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to delete emergency."
            );
        }
    };

    // --------------------------------------------------
    // TRACK
    // --------------------------------------------------

    const handleTrack = (emergency) => {
        Alert.alert(
            "Live Tracking",
            `Driver: ${emergency.ambulance
                ?.driverName ||
            emergency.ambulance?.name ||
            "Unknown"
            }

Vehicle: ${emergency.ambulance
                ?.vehicleNumber || "N/A"
            }

Live map tracking will be connected next.`
        );
    };

    // --------------------------------------------------
    // FILTER HEADER
    // --------------------------------------------------

    const FilterBar = () => (
        <View style={styles.statsGrid}>
            {FILTERS.map((filter) => {
                const selected =
                    activeFilter === filter.key;

                return (
                    <TouchableOpacity
                        key={filter.key}
                        activeOpacity={0.8}
                        style={[
                            styles.statCard,
                            selected &&
                            styles.statCardSelected,
                        ]}
                        onPress={() =>
                            setActiveFilter(filter.key)
                        }
                    >
                        <Text
                            style={[
                                styles.statLabel,
                                selected &&
                                styles.statLabelSelected,
                            ]}
                        >
                            {filter.label}
                        </Text>

                        <Text
                            style={[
                                styles.statCount,
                                selected &&
                                styles.statCountSelected,
                            ]}
                        >
                            {getCount(filter.key)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <AdminLayout
            title="Emergency Logs"
            description="Live emergency dispatch records"
        >
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="large"
                        color="#dc2626"
                    />

                    <Text style={styles.loadingText}>
                        Loading emergencies...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={visibleEmergencies}

                    keyExtractor={(item, index) =>
                        item?._id?.toString() ||
                        `emergency-${index}`
                    }

                    ListHeaderComponent={
                        <FilterBar />
                    }

                    renderItem={({ item }) => (
                        <EmergencyCard
                            emergency={item}
                            onView={handleView}
                            onDelete={handleDelete}
                            onTrack={handleTrack}
                        />
                    )}

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }

                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Text style={styles.emptyTitle}>
                                No emergencies
                            </Text>

                            <Text style={styles.emptyText}>
                                No emergency records match
                                this filter.
                            </Text>
                        </View>
                    }

                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },

    statCard: {
        width: "48%",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 15,
        marginBottom: 12,

        elevation: 1,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 5,
    },

    statCardSelected: {
        backgroundColor: "#eef2ff",
        borderColor: "#6366f1",
        borderWidth: 1.5,
    },

    statLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
    },

    statLabelSelected: {
        color: "#4f46e5",
    },

    statCount: {
        marginTop: 5,
        fontSize: 26,
        fontWeight: "800",
        color: "#111827",
    },

    statCountSelected: {
        color: "#4f46e5",
    },

    loader: {
        paddingVertical: 80,
        alignItems: "center",
    },

    loadingText: {
        marginTop: 12,
        color: "#6b7280",
    },

    list: {
        paddingBottom: 100,
    },

    empty: {
        alignItems: "center",
        paddingVertical: 70,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },

    emptyText: {
        color: "#6b7280",
        marginTop: 7,
    },
});