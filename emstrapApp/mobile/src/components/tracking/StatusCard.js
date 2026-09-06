import { StyleSheet, Text, View } from "react-native";

const STATUS_CONFIG = {
    PENDING: {
        color: "#F59E0B",
        title: "Waiting for Ambulance",
        message: "Your emergency has been received.",
    },

    ACCEPTED: {
        color: "#3B82F6",
        title: "Ambulance Assigned",
        message: "An ambulance has accepted your request.",
    },

    EN_ROUTE: {
        color: "#2563EB",
        title: "Ambulance En Route",
        message: "The ambulance is on its way to your location.",
    },

    ARRIVED: {
        color: "#10B981",
        title: "Ambulance Arrived",
        message: "The ambulance has reached your location.",
    },

    HOSPITAL_ASSIGNED: {
        color: "#8B5CF6",
        title: "Hospital Assigned",
        message: "A hospital has been assigned for treatment.",
    },

    COMPLETED: {
        color: "#059669",
        title: "Emergency Completed",
        message: "This emergency has been successfully resolved.",
    },

    CANCELLED: {
        color: "#EF4444",
        title: "Emergency Cancelled",
        message: "This emergency request has been cancelled.",
    },
};

export default function StatusCard({ emergency }) {
    const status = emergency?.status || "PENDING";

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