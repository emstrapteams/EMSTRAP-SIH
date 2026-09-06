import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AdminStatCard({
    title,
    value,
    helper,
    color = "#2563eb",
}) {
    return (
        <View style={styles.card}>
            <View
                style={[
                    styles.bar,
                    {
                        backgroundColor: color,
                    },
                ]}
            />

            <Text style={styles.title}>{title}</Text>

            <Text style={styles.value}>{value}</Text>

            {helper ? (
                <Text style={styles.helper}>{helper}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 18,
        marginVertical: 8,
        elevation: 3,
    },

    bar: {
        width: 50,
        height: 5,
        borderRadius: 3,
        marginBottom: 15,
    },

    title: {
        fontSize: 13,
        color: "#777",
        fontWeight: "600",
    },

    value: {
        fontSize: 34,
        fontWeight: "bold",
        marginTop: 8,
        color: "#111",
    },

    helper: {
        marginTop: 10,
        color: "#666",
    },
});