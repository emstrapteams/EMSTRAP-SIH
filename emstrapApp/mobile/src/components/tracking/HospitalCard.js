import { StyleSheet, Text, View } from "react-native";

export default function HospitalCard({ emergency }) {
    const hospital = emergency?.hospital;

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Hospital Information
            </Text>

            {!hospital ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🏥</Text>

                    <Text style={styles.emptyTitle}>
                        Hospital Not Assigned
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        A hospital will be assigned once an ambulance accepts your emergency.
                    </Text>
                </View>
            ) : (
                <>
                    <InfoRow
                        label="Hospital"
                        value={hospital.name}
                    />

                    <InfoRow
                        label="Phone"
                        value={hospital.mobile || hospital.phone}
                    />

                    <InfoRow
                        label="Email"
                        value={hospital.email}
                    />

                    <InfoRow
                        label="Address"
                        value={hospital.address}
                    />

                    <InfoRow
                        label="Emergency Beds"
                        value={
                            hospital.emergencyBeds !== undefined
                                ? hospital.emergencyBeds
                                : "-"
                        }
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
        alignItems: "flex-start",
        paddingVertical: 12,
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