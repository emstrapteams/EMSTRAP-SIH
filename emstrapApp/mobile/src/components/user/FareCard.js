import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FareCard({ distance, fare }) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Estimated Total</Text>
                <Text style={styles.fare}>₹{fare}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <Text style={styles.distanceLabel}>Distance</Text>
                <Text style={styles.distance}>{distance}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    label: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },

    fare: {
        fontSize: 26,
        fontWeight: "700",
        color: "#DC2626",
    },

    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: 16,
    },

    distanceLabel: {
        color: "#6B7280",
        fontSize: 15,
    },

    distance: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
});