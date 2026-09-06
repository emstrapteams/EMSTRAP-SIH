import React from "react";

import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
} from "react-native";

export default function PoliceStatCard({
    title,
    value,
    selected,
    color,
    backgroundColor,
    onPress,
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.card,
                selected && {
                    borderColor: color,
                    backgroundColor:
                        backgroundColor,
                },
            ]}
        >
            <View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: color,
                    },
                ]}
            />

            <Text
                style={[
                    styles.value,
                    selected && {
                        color,
                    },
                ]}
            >
                {value}
            </Text>

            <Text
                style={[
                    styles.title,
                    selected && {
                        color,
                    },
                ]}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "48%",
        minHeight: 120,

        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 16,

        paddingHorizontal: 16,
        paddingVertical: 15,

        marginBottom: 12,
    },

    indicator: {
        width: 34,
        height: 4,
        borderRadius: 20,
        marginBottom: 15,
    },

    value: {
        fontSize: 27,
        fontWeight: "800",
        color: "#111827",
    },

    title: {
        marginTop: 5,

        fontSize: 13,
        fontWeight: "600",

        color: "#6b7280",
    },
});