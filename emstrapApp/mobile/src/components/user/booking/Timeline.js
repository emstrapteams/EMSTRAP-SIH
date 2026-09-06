import { StyleSheet, Text, View } from "react-native";

export default function Timeline({ booking }) {
    const status = booking?.status || "PENDING";

    const steps = [
        {
            title: "Booking Created",
            active: true,
        },
        {
            title: "Driver Accepted",
            active: [
                "ACCEPTED",
                "ARRIVED",
                "IN_PROGRESS",
                "COMPLETED",
            ].includes(status),
        },
        {
            title: "Driver Arrived",
            active: [
                "ARRIVED",
                "IN_PROGRESS",
                "COMPLETED",
            ].includes(status),
        },
        {
            title: "Trip Started",
            active: [
                "IN_PROGRESS",
                "COMPLETED",
            ].includes(status),
        },
        {
            title: "Trip Completed",
            active: status === "COMPLETED",
        },
    ];

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Trip Progress
            </Text>

            {steps.map((step, index) => (
                <View key={index} style={styles.row}>
                    <View
                        style={[
                            styles.dot,
                            step.active && styles.activeDot,
                        ]}
                    />

                    <Text
                        style={[
                            styles.text,
                            step.active && styles.activeText,
                        ]}
                    >
                        {step.title}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        elevation: 3,
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 18,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },

    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#CBD5E1",
        marginRight: 14,
    },

    activeDot: {
        backgroundColor: "#22C55E",
    },

    text: {
        color: "#94A3B8",
        fontSize: 16,
    },

    activeText: {
        color: "#111827",
        fontWeight: "700",
    },
});