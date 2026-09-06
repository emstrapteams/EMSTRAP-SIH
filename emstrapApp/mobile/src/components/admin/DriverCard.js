import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DriverCard({
    driver,
    onView,
    onEdit,
    onDelete,
}) {
    return (
        <View style={styles.card}>

            <View style={styles.header}>

                <View style={styles.iconBox}>
                    <Ionicons
                        name="car-outline"
                        size={24}
                        color="#dc2626"
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        {driver.name}
                    </Text>

                    <Text style={styles.vehicle}>
                        {driver.vehicleNumber}
                    </Text>
                </View>
            </View>

            <View style={styles.row}>
                <Ionicons
                    name="call-outline"
                    size={18}
                    color="#6b7280"
                />
                <Text style={styles.info}>
                    {driver.mobile}
                </Text>
            </View>

            <View style={styles.row}>
                <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#6b7280"
                />
                <Text style={styles.info}>
                    {driver.email}
                </Text>
            </View>

            <View style={styles.badges}>

                <View
                    style={[
                        styles.badge,
                        driver.driverType === "government"
                            ? styles.govBadge
                            : styles.privateBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.badgeText,
                            driver.driverType === "government"
                                ? styles.govText
                                : styles.privateText,
                        ]}
                    >
                        {driver.driverType === "government"
                            ? "Government"
                            : "Private"}
                    </Text>
                </View>

                <View
                    style={[
                        styles.badge,
                        driver.driverStatus === "LIVE"
                            ? styles.onlineBadge
                            : styles.offlineBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.badgeText,
                            driver.driverStatus === "LIVE"
                                ? styles.onlineText
                                : styles.offlineText,
                        ]}
                    >
                        {driver.driverStatus === "LIVE"
                            ? "Online"
                            : "Offline"}
                    </Text>
                </View>

            </View>

            <View style={styles.actions}>

                <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => onView(driver)}
                >
                    <Ionicons
                        name="eye-outline"
                        size={18}
                        color="#2563eb"
                    />
                    <Text style={styles.viewText}>
                        View
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEdit(driver)}
                >
                    <Ionicons
                        name="create-outline"
                        size={18}
                        color="#f59e0b"
                    />
                    <Text style={styles.editText}>
                        Edit
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(driver)}
                >
                    <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#dc2626"
                    />
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
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },

    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },

    vehicle: {
        color: "#6b7280",
        marginTop: 2,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    info: {
        marginLeft: 10,
        color: "#374151",
        fontSize: 15,
    },

    badges: {
        flexDirection: "row",
        marginTop: 16,
        gap: 10,
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    badgeText: {
        fontWeight: "700",
        fontSize: 12,
    },

    govBadge: {
        backgroundColor: "#dbeafe",
    },

    govText: {
        color: "#1d4ed8",
    },

    privateBadge: {
        backgroundColor: "#dcfce7",
    },

    privateText: {
        color: "#15803d",
    },

    onlineBadge: {
        backgroundColor: "#dcfce7",
    },

    onlineText: {
        color: "#15803d",
    },

    offlineBadge: {
        backgroundColor: "#e5e7eb",
    },

    offlineText: {
        color: "#4b5563",
    },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },

    viewBtn: {
        flexDirection: "row",
        alignItems: "center",
    },

    editBtn: {
        flexDirection: "row",
        alignItems: "center",
    },

    deleteBtn: {
        flexDirection: "row",
        alignItems: "center",
    },

    viewText: {
        marginLeft: 4,
        color: "#2563eb",
        fontWeight: "600",
    },

    editText: {
        marginLeft: 4,
        color: "#f59e0b",
        fontWeight: "600",
    },

    deleteText: {
        marginLeft: 4,
        color: "#dc2626",
        fontWeight: "600",
    },

});