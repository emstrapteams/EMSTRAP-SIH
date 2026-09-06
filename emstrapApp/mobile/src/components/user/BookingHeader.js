import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function BookingHeader() {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name="ambulance"
                    size={28}
                    color="#DC2626"
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>Book an Ambulance</Text>

                <Text style={styles.subtitle}>
                    Plan ahead with specific equipment needs and upfront pricing.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 28,
    },

    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: "#FEE2E2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    textContainer: {
        flex: 1,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
    },

    subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: "#6B7280",
        lineHeight: 20,
    },
});