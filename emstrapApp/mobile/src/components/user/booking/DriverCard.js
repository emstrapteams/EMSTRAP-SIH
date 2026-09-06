import { StyleSheet, Text, View } from "react-native";

export default function DriverCard({ booking }) {
    const driver = booking?.ambulance || null;

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Driver Information
            </Text>

            {!driver ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🚑</Text>

                    <Text style={styles.emptyTitle}>
                        Waiting for Driver
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        We're searching for the nearest available private driver.
                    </Text>
                </View>
            ) : (
                <>
                    <InfoRow
                        label="Driver"
                        value={driver.name}
                    />

                    <InfoRow
                        label="Phone"
                        value={driver.mobile || driver.phone}
                    />

                    <InfoRow
                        label="Email"
                        value={driver.email}
                    />

                    <InfoRow
                        label="Vehicle"
                        value={driver.vehicleNumber}
                    />

                    <InfoRow
                        label="Driver Status"
                        value={driver.driverStatus}
                    />

                    <InfoRow
                        label="On Trip"
                        value={driver.isOnTrip ? "Yes" : "No"}
                    />

                    <InfoRow
                        label="Vehicle Type"
                        value={driver.vehicleType || booking?.ambulanceType}
                    />

                    <InfoRow
                        label="Status"
                        value={booking?.status}
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