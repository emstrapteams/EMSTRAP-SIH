import { StyleSheet, Text, View } from "react-native";

export default function AmbulanceCard({ emergency }) {
    const ambulance = emergency?.ambulance;

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Ambulance Information
            </Text>

            {!ambulance ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🚑</Text>

                    <Text style={styles.emptyTitle}>
                        No Ambulance Assigned
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        We're searching for the nearest available ambulance.
                    </Text>
                </View>
            ) : (
                <>
                    <InfoRow
                        label="Driver"
                        value={ambulance.name}
                    />

                    <InfoRow
                        label="Phone"
                        value={ambulance.mobile}
                    />

                    <InfoRow
                        label="Email"
                        value={ambulance.email}
                    />

                    <InfoRow
                        label="Vehicle"
                        value={ambulance.vehicleNumber}
                    />

                    <InfoRow
                        label="Status"
                        value={emergency.status}
                    />
                </>
            )}
        </View>
    );
}

function InfoRow({ label, value }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>
                {label}
            </Text>

            <Text style={styles.value}>
                {value || "-"}
            </Text>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },

    label: {
        color: "#6B7280",
        fontSize: 15,
    },

    value: {
        color: "#111827",
        fontWeight: "600",
        maxWidth: "60%",
        textAlign: "right",
    },

    emptyContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },

    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6,
    },

    emptySubtitle: {
        textAlign: "center",
        color: "#6B7280",
        fontSize: 15,
        lineHeight: 22,
    },
});