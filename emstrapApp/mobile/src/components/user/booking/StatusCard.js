import { StyleSheet, Text, View } from "react-native";

const STATUS_CONFIG = {

    PENDING: {
        color: "#F59E0B",
        title: "Searching Driver",
        message: "Looking for the nearest available private driver.",
    },

    ACCEPTED: {
        color: "#2563EB",
        title: "Driver Assigned",
        message: "A driver has accepted your booking.",
    },

    ARRIVED: {
        color: "#10B981",
        title: "Driver Arrived",
        message: "Your driver has reached the pickup location.",
    },

    IN_PROGRESS: {
        color: "#7C3AED",
        title: "Trip Started",
        message: "You are on your way to your destination.",
    },

    COMPLETED: {
        color: "#059669",
        title: "Trip Completed",
        message: "Hope you had a safe journey.",
    },

    CANCELLED: {
        color: "#DC2626",
        title: "Booking Cancelled",
        message: "This booking has been cancelled.",
    },

};
export default function StatusCard({ booking }) {
    const status = booking?.status || "PENDING";
    const config =
        STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

    return (
        <View
            style={[
                styles.container,
                {
                    borderLeftColor: config.color,
                },
            ]}
        >
            <View
                style={[
                    styles.badge,
                    {
                        backgroundColor: config.color,
                    },
                ]}
            >
                <Text style={styles.badgeText}>
                    {status.replace(/_/g, " ")}
                </Text>
            </View>

            <Text style={styles.title}>
                {config.title}
            </Text>

            <Text style={styles.message}>
                {config.message}
            </Text>

            <Text style={styles.updated}>
                Last updated just now
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        borderLeftWidth: 6,
        elevation: 3,
    },

    badge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 999,
        marginBottom: 14,
    },

    badgeText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 8,
    },

    message: {
        fontSize: 15,
        color: "#4B5563",
        lineHeight: 22,
    },

    updated: {
        marginTop: 16,
        fontSize: 13,
        color: "#9CA3AF",
    },
});