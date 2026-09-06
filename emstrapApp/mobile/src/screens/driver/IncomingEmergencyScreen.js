import React from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDriver } from "../../context/DriverContext";

import {
    acceptEmergency,
    declineEmergency,
} from "../../services/driverEmergencyService";

export default function IncomingEmergencyScreen() {

    const router = useRouter();

    const {
        currentEmergency,
        setCurrentEmergency,
        setIncomingVisible,
    } = useDriver();
    if (!currentEmergency) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>No emergency available.</Text>
            </SafeAreaView>
        );
    }

    const handleAccept = async () => {

        try {

            const response = await acceptEmergency(currentEmergency._id);

            console.log("ACCEPT RESPONSE:", response);

            const acceptedEmergency =
                response.data || currentEmergency;

            setCurrentEmergency(acceptedEmergency);

            setIncomingVisible(false);

            await AsyncStorage.setItem(
                "currentEmergency",
                JSON.stringify(acceptedEmergency)
            );

            router.replace("/driver/navigation");

        } catch (err) {

            console.log(err);

        }

    };
    const handleDecline = async () => {

        try {

            await declineEmergency(currentEmergency._id);

            setIncomingVisible(false);

            await AsyncStorage.removeItem(
                "currentEmergency"
            );

            setCurrentEmergency(null);

            router.back();

        } catch (err) {

            console.log(err);

        }

    };
    return (

        <SafeAreaView style={styles.container}>

            <View style={styles.card}>

                <Text style={styles.heading}>
                    🚨 Incoming Emergency
                </Text>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Type</Text>
                    <Text style={styles.value}>
                        {currentEmergency.requestType || "-"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Priority</Text>
                    <Text style={styles.priority}>
                        {currentEmergency.priority || "-"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Patient</Text>
                    <Text style={styles.value}>
                        {currentEmergency.user?.name || "Anonymous"}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>
                        {currentEmergency.location?.address || "-"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={handleAccept}
                >
                    <Text style={styles.acceptText}>
                        ACCEPT
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.declineButton}
                    onPress={handleDecline}
                >
                    <Text style={styles.declineText}>
                        DECLINE
                    </Text>
                </TouchableOpacity>

            </View>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
        padding: 20,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 22,
        elevation: 5,
    },

    heading: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 24,
        color: "#111827",
    },

    infoRow: {
        marginBottom: 18,
    },

    label: {
        color: "#6B7280",
        fontSize: 13,
        marginBottom: 4,
    },

    value: {
        fontSize: 17,
        color: "#111827",
        fontWeight: "600",
    },

    priority: {
        fontSize: 17,
        color: "#DC2626",
        fontWeight: "700",
    },

    acceptButton: {
        marginTop: 20,
        backgroundColor: "#16A34A",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },

    acceptText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },

    declineButton: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#DC2626",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },

    declineText: {
        color: "#DC2626",
        fontWeight: "700",
        fontSize: 16,
    },

});