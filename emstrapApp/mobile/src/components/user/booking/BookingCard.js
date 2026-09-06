import { StyleSheet, Text, View } from "react-native";

export default function BookingCard({ booking }) {
    if (!booking) return null;

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>
                Booking Details
            </Text>

            <View style={styles.row}>
                <Text style={styles.label}>Booking ID</Text>
                <Text style={styles.value}>
                    {booking._id}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Pickup</Text>
                <Text style={styles.value}>
                    {booking.pickupLocation?.address || "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Destination</Text>
                <Text style={styles.value}>
                    {booking.dropoffLocation?.address || "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Distance</Text>
                <Text style={styles.value}>
                    {booking.distanceKm
                        ? `${booking.distanceKm.toFixed(1)} km`
                        : "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Estimated Time</Text>
                <Text style={styles.value}>
                    {booking.durationMin
                        ? `${booking.durationMin} min`
                        : "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Ambulance</Text>
                <Text style={styles.value}>
                    {booking.ambulanceType || "-"}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Fare</Text>
                <Text style={styles.value}>
                    ₹{booking.price || booking.finalPrice || 0}
                </Text>
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Booked At</Text>
                <Text style={styles.value}>
                    {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString()
                        : "-"}
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
});