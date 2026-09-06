import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PoliceCard({
    police,
    onView,
    onEdit,
    onDelete,
}) {
    const isHQ = police.role === "police_hq";

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name="shield"
                        size={24}
                        color="#7c3aed"
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        {police.name}
                    </Text>

                    <Text style={styles.city}>
                        {police.city}
                    </Text>
                </View>

                <View
                    style={[
                        styles.badge,
                        isHQ ? styles.hq : styles.station,
                    ]}
                >
                    <Text style={styles.badgeText}>
                        {isHQ ? "HQ" : "Station"}
                    </Text>
                </View>
            </View>

            {/* Details */}

            <View style={styles.infoRow}>
                <Ionicons
                    name="location-outline"
                    size={18}
                    color="#6b7280"
                />

                <Text style={styles.infoText}>
                    {police.address}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons
                    name="call-outline"
                    size={18}
                    color="#6b7280"
                />

                <Text style={styles.infoText}>
                    {police.mobile}
                </Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#6b7280"
                />

                <Text style={styles.infoText}>
                    {police.email}
                </Text>
            </View>

            <View style={styles.divider} />

            {/* Buttons */}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => onView(police)}
                >
                    <Text style={styles.viewText}>
                        View
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => onEdit(police)}
                >
                    <Text style={styles.editText}>
                        Edit
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(police)}
                >
                    <Text style={styles.deleteText}>
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        padding: 18,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },

    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f3e8ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },

    city: {
        marginTop: 3,
        color: "#6b7280",
        fontSize: 14,
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },

    station: {
        backgroundColor: "#dbeafe",
    },

    hq: {
        backgroundColor: "#ede9fe",
    },

    badgeText: {
        fontWeight: "700",
        color: "#111827",
        fontSize: 12,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 5,
    },

    infoText: {
        marginLeft: 10,
        flex: 1,
        color: "#4b5563",
        fontSize: 14,
    },

    divider: {
        height: 1,
        backgroundColor: "#e5e7eb",
        marginVertical: 16,
    },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    viewButton: {
        backgroundColor: "#f3f4f6",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
    },

    editButton: {
        backgroundColor: "#dbeafe",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
    },

    deleteButton: {
        backgroundColor: "#fee2e2",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 10,
    },

    viewText: {
        color: "#374151",
        fontWeight: "600",
    },

    editText: {
        color: "#2563eb",
        fontWeight: "600",
    },

    deleteText: {
        color: "#dc2626",
        fontWeight: "600",
    },
});