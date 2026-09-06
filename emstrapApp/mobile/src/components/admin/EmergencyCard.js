import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const getStatusStyle = (status) => {
    const value = (status || "").toUpperCase();

    if (["COMPLETED", "RESOLVED"].includes(value)) {
        return {
            backgroundColor: "#dcfce7",
            color: "#15803d",
        };
    }

    if (value === "PENDING") {
        return {
            backgroundColor: "#fef3c7",
            color: "#b45309",
        };
    }

    if (
        [
            "AMBULANCE_ACCEPTED",
            "ARRIVED_AT_LOCATION",
            "EN_ROUTE_TO_HOSPITAL",
        ].includes(value)
    ) {
        return {
            backgroundColor: "#fee2e2",
            color: "#dc2626",
        };
    }

    if (value === "CANCELLED") {
        return {
            backgroundColor: "#e5e7eb",
            color: "#4b5563",
        };
    }

    return {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
    };
};

export default function EmergencyCard({
    emergency,
    onView,
    onDelete,
    onTrack,
}) {
    const statusStyle = getStatusStyle(
        emergency.status
    );

    const patient =
        emergency.user?.name ||
        "Anonymous / System";

    const driver =
        emergency.ambulance?.driverName ||
        emergency.ambulance?.name ||
        "Awaiting Response";

    const latitude =
        emergency.location?.latitude;

    const longitude =
        emergency.location?.longitude;

    const canTrack =
        !!emergency.ambulance &&
        ![
            "RESOLVED",
            "COMPLETED",
            "CANCELLED",
        ].includes(
            (emergency.status || "").toUpperCase()
        );

    return (
        <View style={styles.card}>

            <View style={styles.topRow}>

                <View
                    style={[
                        styles.iconBox,
                        {
                            backgroundColor:
                                statusStyle.backgroundColor,
                        },
                    ]}
                >
                    <Ionicons
                        name="warning-outline"
                        size={25}
                        color={statusStyle.color}
                    />
                </View>

                <View style={styles.headerContent}>

                    <Text style={styles.patient}>
                        {patient}
                    </Text>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    statusStyle.backgroundColor,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                {
                                    color:
                                        statusStyle.color,
                                },
                            ]}
                        >
                            {emergency.status ||
                                "UNKNOWN"}
                        </Text>
                    </View>

                </View>

            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <Ionicons
                    name="location-outline"
                    size={19}
                    color="#6b7280"
                />

                <Text style={styles.info}>
                    {latitude != null &&
                        longitude != null
                        ? `${Number(latitude).toFixed(
                            4
                        )}, ${Number(
                            longitude
                        ).toFixed(4)}`
                        : "Location unavailable"}
                </Text>
            </View>

            <View style={styles.row}>
                <Ionicons
                    name="car-outline"
                    size={19}
                    color="#6b7280"
                />

                <Text style={styles.info}>
                    {driver}
                </Text>
            </View>

            {emergency.ambulance?.vehicleNumber ? (
                <View style={styles.row}>
                    <Ionicons
                        name="key-outline"
                        size={19}
                        color="#6b7280"
                    />

                    <Text style={styles.info}>
                        {
                            emergency.ambulance
                                .vehicleNumber
                        }
                    </Text>
                </View>
            ) : null}

            {emergency.hospital?.name ? (
                <View style={styles.row}>
                    <Ionicons
                        name="medical-outline"
                        size={19}
                        color="#6b7280"
                    />

                    <Text style={styles.info}>
                        {emergency.hospital.name}
                    </Text>
                </View>
            ) : null}

            <Text style={styles.date}>
                {emergency.createdAt
                    ? new Date(
                        emergency.createdAt
                    ).toLocaleString()
                    : ""}
            </Text>

            <View style={styles.actions}>

                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                        onView(emergency)
                    }
                >
                    <Ionicons
                        name="eye-outline"
                        size={17}
                        color="#374151"
                    />

                    <Text style={styles.viewText}>
                        View
                    </Text>
                </TouchableOpacity>

                {canTrack && onTrack ? (
                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() =>
                            onTrack(emergency)
                        }
                    >
                        <Ionicons
                            name="navigate-outline"
                            size={17}
                            color="#2563eb"
                        />

                        <Text style={styles.trackText}>
                            Track
                        </Text>
                    </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                        onDelete(emergency)
                    }
                >
                    <Ionicons
                        name="trash-outline"
                        size={17}
                        color="#dc2626"
                    />

                    <Text style={styles.deleteText}>
                        Delete
                    </Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 17,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 7,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    headerContent: {
        flex: 1,
    },

    patient: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },

    statusBadge: {
        alignSelf: "flex-start",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },

    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },

    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 15,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 9,
    },

    info: {
        marginLeft: 9,
        color: "#4b5563",
        fontSize: 14,
        flex: 1,
    },

    date: {
        color: "#9ca3af",
        fontSize: 12,
        marginTop: 4,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 17,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingTop: 14,
    },

    viewButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3f4f6",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 9,
    },

    viewText: {
        color: "#374151",
        fontWeight: "600",
        marginLeft: 5,
    },

    trackButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 9,
    },

    trackText: {
        color: "#2563eb",
        fontWeight: "600",
        marginLeft: 5,
    },

    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fef2f2",
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 9,
    },

    deleteText: {
        color: "#dc2626",
        fontWeight: "600",
        marginLeft: 5,
    },
});