import React, { useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import socket from "../../services/socket";

export default function SearchingDriverScreen({
    bookingId,
}) {

    const router = useRouter();

    useEffect(() => {
        socket.connect();

        const onConnect = () => {
            console.log("✅ Socket connected:", socket.id);

            socket.emit("track_request", {
                requestId: bookingId,
            });
        };

        const onDriverAssigned = (driver) => {
            console.log("🚑 Driver Assigned:", driver);

            router.replace({
                pathname: "/user/booking-tracking",
                params: {
                    bookingId,
                },
            });
        };

        socket.on("connect", onConnect);
        socket.on("ambulance_assigned", onDriverAssigned);
        socket.onAny((event, ...args) => {
            console.log("📨 SOCKET EVENT:", event, args);
        });
        return () => {
            socket.off("connect", onConnect);
            socket.off("ambulance_assigned", onDriverAssigned);
            socket.offAny();
            socket.disconnect();
        };
    }, [bookingId]);

    return (
        <SafeAreaView style={styles.container}>

            <ActivityIndicator
                size="large"
                color="#2563EB"
            />

            <Text style={styles.title}>
                Searching for a Driver
            </Text>

            <Text style={styles.subtitle}>
                Looking for the nearest available private ambulance driver...
            </Text>

            <View style={styles.card}>

                <Text style={styles.label}>
                    Estimated wait
                </Text>

                <Text style={styles.time}>
                    30–60 sec
                </Text>

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#F8FAFC",
    },

    title: {
        marginTop: 24,
        fontSize: 26,
        fontWeight: "700",
        color: "#111827",
    },

    subtitle: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 16,
        color: "#6B7280",
        lineHeight: 24,
    },

    card: {
        marginTop: 40,
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 24,
        elevation: 3,
        alignItems: "center",
    },

    label: {
        color: "#6B7280",
        fontSize: 15,
    },

    time: {
        marginTop: 10,
        fontSize: 30,
        fontWeight: "700",
        color: "#2563EB",
    }

});