import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function AmbulanceTypeCard({
    title,
    code,
    description,
    baseFare,
    icon,
    selected,
    onPress,
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={[
                styles.card,
                selected && styles.selectedCard,
            ]}
        >
            <View style={styles.topRow}>
                <MaterialCommunityIcons
                    name={icon}
                    size={28}
                    color={selected ? "#2563EB" : "#DC2626"}
                />

                {selected && (
                    <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color="#2563EB"
                    />
                )}
            </View>

            <Text
                style={[
                    styles.title,
                    selected && styles.selectedText,
                ]}
            >
                {title}
            </Text>

            <Text style={styles.code}>{code}</Text>

            <Text style={styles.description}>
                {description}
            </Text>

            <Text style={styles.price}>
                ₹{baseFare} minimum
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    selectedCard: {
        borderColor: "#2563EB",
        backgroundColor: "#EFF6FF",
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },

    title: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },

    selectedText: {
        color: "#2563EB",
    },

    code: {
        marginTop: 2,
        color: "#6B7280",
        fontWeight: "600",
        marginBottom: 10,
    },

    description: {
        color: "#6B7280",
        lineHeight: 20,
        marginBottom: 16,
    },

    price: {
        color: "#DC2626",
        fontWeight: "700",
        fontSize: 15,
    },
});