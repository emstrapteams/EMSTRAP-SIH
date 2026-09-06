import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
    acceptEmergency,
    declineEmergency,
} from "../../services/driverEmergencyService";

import { useDriver } from "../../context/DriverContext";

export default function IncomingEmergencyModal() {

    const router = useRouter();

    const {

        incomingVisible,
        setIncomingVisible,

        currentEmergency,
        setCurrentEmergency,

    } = useDriver();

    const [seconds, setSeconds] = useState(20);

    useEffect(() => {

        if (!incomingVisible) return;

        setSeconds(20);

        const interval = setInterval(() => {

            setSeconds((prev) => {

                if (prev <= 1) {

                    clearInterval(interval);

                    handleDecline();

                    return 0;

                }

                return prev - 1;

            });

        }, 1000);

        return () => clearInterval(interval);

    }, [incomingVisible]);

    if (!currentEmergency) return null;

    async function handleAccept() {

        try {

            await acceptEmergency(currentEmergency._id);

            await AsyncStorage.setItem(
                "currentEmergency",
                JSON.stringify(currentEmergency)
            );

            setIncomingVisible(false);

            router.replace("/driver/navigation");

        } catch (err) {

            console.log(err);

        }

    }

    async function handleDecline() {

        try {

            await declineEmergency(currentEmergency._id);

            await AsyncStorage.removeItem(
                "currentEmergency"
            );

            setIncomingVisible(false);

            setCurrentEmergency(null);

        } catch (err) {

            console.log(err);

        }

    }

    return (

        <Modal

            visible={incomingVisible}

            transparent

            animationType="slide"

        >

            <View style={styles.overlay}>

                <View style={styles.card}>

                    <Text style={styles.title}>
                        🚨 NEW EMERGENCY
                    </Text>

                    <Text style={styles.type}>
                        {currentEmergency.requestType}
                    </Text>

                    <Text style={styles.priority}>
                        {currentEmergency.priority}
                    </Text>

                    <Text style={styles.location}>
                        {currentEmergency.location?.address}
                    </Text>

                    <View style={styles.timerContainer}>

                        <Text style={styles.timer}>
                            {seconds}s
                        </Text>

                    </View>

                    <TouchableOpacity

                        style={styles.accept}

                        onPress={handleAccept}

                    >

                        <Text style={styles.acceptText}>
                            ACCEPT
                        </Text>

                    </TouchableOpacity>

                    <TouchableOpacity

                        style={styles.decline}

                        onPress={handleDecline}

                    >

                        <Text style={styles.declineText}>
                            DECLINE
                        </Text>

                    </TouchableOpacity>

                </View>

            </View>

        </Modal>

    );

}

const styles = StyleSheet.create({

    overlay: {

        flex: 1,

        backgroundColor: "rgba(0,0,0,0.45)",

        justifyContent: "flex-end",

    },

    card: {

        backgroundColor: "#FFF",

        padding: 24,

        borderTopLeftRadius: 28,

        borderTopRightRadius: 28,

    },

    title: {

        fontSize: 26,

        fontWeight: "700",

        textAlign: "center",

        color: "#DC2626",

    },

    type: {

        fontSize: 22,

        textAlign: "center",

        marginTop: 20,

        fontWeight: "700",

    },

    priority: {

        textAlign: "center",

        marginTop: 8,

        color: "#DC2626",

        fontWeight: "700",

        fontSize: 18,

    },

    location: {

        textAlign: "center",

        marginTop: 12,

        color: "#6B7280",

    },

    timerContainer: {

        marginVertical: 30,

        alignItems: "center",

    },

    timer: {

        fontSize: 40,

        fontWeight: "700",

        color: "#DC2626",

    },

    accept: {

        backgroundColor: "#16A34A",

        padding: 18,

        borderRadius: 14,

        alignItems: "center",

    },

    acceptText: {

        color: "#FFF",

        fontSize: 18,

        fontWeight: "700",

    },

    decline: {

        marginTop: 14,

        borderWidth: 1,

        borderColor: "#DC2626",

        padding: 18,

        borderRadius: 14,

        alignItems: "center",

    },

    declineText: {

        color: "#DC2626",

        fontSize: 18,

        fontWeight: "700",

    },

});