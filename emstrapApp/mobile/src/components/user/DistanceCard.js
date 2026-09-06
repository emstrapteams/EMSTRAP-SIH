import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function DistanceCard({
    distance,
    duration,
}) {
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons
                        name="navigation-variant"
                        size={18}
                        color="#2563EB"
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>
                        Calculated Distance
                    </Text>

                    <Text style={styles.subtitle}>
                        Estimated based on the most direct route
                    </Text>
                </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.distance}>
                    {distance ? `${distance} km` : "--"}
                </Text>

                <Text
                    style={{
                        color: "#2563EB",
                        fontSize: 13,
                        marginTop: 4,
                    }}
                >
                    {duration ? `${duration} min` : ""}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#EFF6FF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 28,

        borderWidth: 1,
        borderColor: "#BFDBFE",

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    left: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#DBEAFE",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 14,
    },

    title: {
        fontWeight: "700",
        fontSize: 13,
        color: "#1D4ED8",
        textTransform: "uppercase",
    },

    subtitle: {
        fontSize: 12,
        color: "#60A5FA",
        marginTop: 3,
    },

    distance: {
        fontWeight: "700",
        fontSize: 20,
        color: "#1D4ED8",
    },
});