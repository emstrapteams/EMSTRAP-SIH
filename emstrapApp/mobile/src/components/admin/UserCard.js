import React from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";

export default function UserCard({ user }) {
    return (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {(user.name || "U")[0].toUpperCase()}
                </Text>
            </View>

            <Text style={styles.name}>
                {user.name}
            </Text>

            <Text style={styles.email}>
                {user.email}
            </Text>

            <Text>
                📞 {user.mobile || "-"}
            </Text>

            <Text>
                📍 {user.city || "-"}
            </Text>

            <Text style={styles.role}>
                {user.role}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 16,
        elevation: 3,
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2563eb",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },

    avatarText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
    },

    email: {
        color: "#666",
        marginBottom: 8,
    },

    role: {
        marginTop: 10,
        fontWeight: "600",
        color: "#2563eb",
    },
});