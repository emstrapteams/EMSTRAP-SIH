import { StyleSheet, Text, View } from "react-native";

export default function EmergencyCard({ emergency }) {
    if (!emergency) return null;

    const ai = emergency.aiAnalysis || {};

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Emergency Details
            </Text>

            <View style={styles.row}>
                <Text style={styles.label}>Request ID</Text>
                <Text style={styles.value}>
                    {emergency._id || "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Emergency Type</Text>
                <Text style={styles.value}>
                    {ai.predictedClass || "Unknown"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Severity</Text>
                <Text
                    style={[
                        styles.value,
                        styles.severity(ai.severity),
                    ]}
                >
                    {ai.severity || "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>AI Confidence</Text>
                <Text style={styles.value}>
                    {ai.confidence
                        ? `${(ai.confidence * 100).toFixed(1)}%`
                        : "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Priority</Text>
                <Text style={styles.value}>
                    {emergency.priority || "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Created</Text>
                <Text style={styles.value}>
                    {emergency.createdAt
                        ? new Date(
                            emergency.createdAt
                        ).toLocaleString()
                        : "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Latitude</Text>
                <Text style={styles.value}>
                    {emergency.latitude?.toFixed?.(6) ??
                        emergency.latitude ??
                        "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Longitude</Text>
                <Text style={styles.value}>
                    {emergency.longitude?.toFixed?.(6) ??
                        emergency.longitude ??
                        "-"}
                </Text>
            </View>
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
        marginBottom: 18,
        color: "#111827",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },

    label: {
        color: "#6B7280",
        fontSize: 15,
        flex: 1,
    },

    value: {
        color: "#111827",
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
    },

    severity: (level) => ({
        color:
            level === "CRITICAL"
                ? "#DC2626"
                : level === "HIGH"
                    ? "#EA580C"
                    : level === "MODERATE"
                        ? "#D97706"
                        : "#16A34A",
    }),
});