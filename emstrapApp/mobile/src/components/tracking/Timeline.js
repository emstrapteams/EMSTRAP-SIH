import { StyleSheet, Text, View } from "react-native";

const STEPS = [
    {
        key: "PENDING",
        title: "Emergency Created",
        subtitle: "Emergency request received",
    },
    {
        key: "AI_VERIFIED",
        title: "AI Analysis Complete",
        subtitle: "Image classified successfully",
    },
    {
        key: "ACCEPTED",
        title: "Ambulance Assigned",
        subtitle: "Driver accepted the request",
    },
    {
        key: "EN_ROUTE",
        title: "Ambulance En Route",
        subtitle: "Ambulance is on the way",
    },
    {
        key: "ARRIVED",
        title: "Driver Arrived",
        subtitle: "Ambulance reached the location",
    },
    {
        key: "HOSPITAL_ASSIGNED",
        title: "Hospital Assigned",
        subtitle: "Destination hospital selected",
    },
    {
        key: "COMPLETED",
        title: "Emergency Completed",
        subtitle: "Case closed successfully",
    },
];

export default function Timeline({ emergency }) {
    if (!emergency) return null;

    let rawStatus = emergency.status || "PENDING";
    if (rawStatus === "AMBULANCE_ACCEPTED") rawStatus = "ACCEPTED";
    if (rawStatus === "ARRIVED_AT_LOCATION") rawStatus = "ARRIVED";
    if (rawStatus === "EN_ROUTE_TO_HOSPITAL") {
        rawStatus = emergency.hospital ? "HOSPITAL_ASSIGNED" : "EN_ROUTE";
    }

    let currentStatus = rawStatus;

    // Show AI step if AI analysis exists but ambulance not yet assigned
    if (
        emergency.aiAnalysis &&
        currentStatus === "PENDING"
    ) {
        currentStatus = "AI_VERIFIED";
    }

    const currentIndex = STEPS.findIndex(
        (step) => step.key === currentStatus
    );

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Emergency Progress
            </Text>

            {STEPS.map((step, index) => {
                const completed = index < currentIndex;
                const active = index === currentIndex;

                return (
                    <View
                        key={step.key}
                        style={styles.row}
                    >
                        <View style={styles.left}>
                            <View
                                style={[
                                    styles.circle,
                                    completed &&
                                    styles.completedCircle,
                                    active &&
                                    styles.activeCircle,
                                ]}
                            />

                            {index !== STEPS.length - 1 && (
                                <View
                                    style={[
                                        styles.line,
                                        completed &&
                                        styles.completedLine,
                                    ]}
                                />
                            )}
                        </View>

                        <View style={styles.right}>
                            <Text
                                style={[
                                    styles.title,
                                    completed &&
                                    styles.completedText,
                                    active &&
                                    styles.activeText,
                                ]}
                            >
                                {step.title}
                            </Text>

                            <Text style={styles.subtitle}>
                                {completed
                                    ? "Completed"
                                    : active
                                        ? step.subtitle
                                        : "Pending"}
                            </Text>
                        </View>
                    </View>
                );
            })}

            {emergency.status === "CANCELLED" && (
                <View style={styles.cancelBox}>
                    <Text style={styles.cancelText}>
                        ❌ Emergency Cancelled
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 18,
        elevation: 3,
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 20,
    },

    row: {
        flexDirection: "row",
        marginBottom: 18,
    },

    left: {
        width: 30,
        alignItems: "center",
    },

    right: {
        flex: 1,
        paddingLeft: 12,
    },

    circle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#D1D5DB",
    },

    completedCircle: {
        backgroundColor: "#10B981",
    },

    activeCircle: {
        backgroundColor: "#2563EB",
        transform: [{ scale: 1.2 }],
    },

    line: {
        width: 3,
        flex: 1,
        marginTop: 2,
        backgroundColor: "#E5E7EB",
    },

    completedLine: {
        backgroundColor: "#10B981",
    },

    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },

    completedText: {
        color: "#10B981",
    },

    activeText: {
        color: "#2563EB",
    },

    subtitle: {
        marginTop: 3,
        color: "#9CA3AF",
        fontSize: 13,
    },

    cancelBox: {
        marginTop: 10,
        padding: 12,
        backgroundColor: "#FEE2E2",
        borderRadius: 10,
    },

    cancelText: {
        color: "#B91C1C",
        fontWeight: "700",
        textAlign: "center",
    },
});