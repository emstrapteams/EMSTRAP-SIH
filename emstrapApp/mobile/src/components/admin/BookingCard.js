import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const statusColor = (status) => {
    switch ((status || "").toUpperCase()) {
        case "COMPLETED":
        case "RESOLVED":
            return "#16a34a";

        case "PENDING":
            return "#f59e0b";

        case "ASSIGNED":
        case "IN_PROGRESS":
            return "#2563eb";

        case "CANCELLED":
            return "#dc2626";

        default:
            return "#6b7280";
    }
};

export default function BookingCard({
    booking,
    onView,
    onEdit,
    onDelete,
}) {

    return (
        <View style={styles.card}>

            <View style={styles.header}>

                <View>

                    <Text style={styles.name}>
                        {booking.user?.name || "Unknown User"}
                    </Text>

                    <Text style={styles.email}>
                        {booking.user?.email || "No Email"}
                    </Text>

                </View>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor:
                                statusColor(
                                    booking.status
                                ),
                        },
                    ]}
                >
                    <Text style={styles.badgeText}>
                        {booking.status}
                    </Text>
                </View>

            </View>

            <View style={styles.infoRow}>
                <Ionicons
                    name="location"
                    color="#16a34a"
                    size={16}
                />
                <Text
                    style={styles.info}
                    numberOfLines={1}
                >
                    {booking.pickupLocation?.address ||
                        "Pickup"}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons
                    name="flag"
                    color="#dc2626"
                    size={16}
                />
                <Text
                    style={styles.info}
                    numberOfLines={1}
                >
                    {booking.dropoffLocation?.address ||
                        "Dropoff"}
                </Text>
            </View>

            <View style={styles.footer}>

                <Text style={styles.price}>
                    ₹{booking.estimatedPrice || 0}
                </Text>

                <Text style={styles.distance}>
                    {booking.distanceKm || 0} km
                </Text>

            </View>

            <View style={styles.actions}>

                <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => onView(booking)}
                >
                    <Text style={styles.actionText}>
                        View
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEdit(booking)}
                >
                    <Text style={styles.actionText}>
                        Update
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(booking)}
                >
                    <Text style={styles.actionText}>
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
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    name: {
        fontSize: 17,
        fontWeight: "700",
    },

    email: {
        color: "#6b7280",
        marginTop: 2,
    },

    badge: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },

    badgeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },

    info: {
        marginLeft: 8,
        flex: 1,
        color: "#374151",
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },

    price: {
        fontWeight: "700",
        color: "#2563eb",
    },

    distance: {
        color: "#6b7280",
    },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },

    viewBtn: {
        backgroundColor: "#4f46e5",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
    },

    editBtn: {
        backgroundColor: "#2563eb",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
    },

    deleteBtn: {
        backgroundColor: "#dc2626",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
    },

    actionText: {
        color: "#fff",
        fontWeight: "600",
    },

});