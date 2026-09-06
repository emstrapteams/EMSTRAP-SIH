import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmergencyHeader() {
    return (
        <SafeAreaView edges={["top"]} style={styles.safe}>
            <View style={styles.header}>
                <Image
                    source={require("../../assets/logo.png")} // Change to your logo path
                    style={styles.logo}
                />

                <View style={styles.center}>
                    <Text style={styles.title}>Emergency</Text>
                    <Text style={styles.subtitle}>
                        Fast • Secure • Real-time
                    </Text>
                </View>

                <View style={{ width: 36 }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        backgroundColor: "#fff",
    },

    header: {
        height: 72,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },

    logo: {
        width: 34,
        height: 34,
        resizeMode: "contain",
    },

    center: {
        flex: 1,
        alignItems: "center",
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },

    subtitle: {
        fontSize: 12,
        color: "#6B7280",
    },
});