import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import {
    acceptEmergency,
    declineEmergency,
} from "../../services/driverEmergencyService";

import { useDriver } from "../../context/DriverContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EmergencyCard({ emergency }) {

    const router = useRouter();

    const {
        setCurrentEmergency,
        setIncomingEmergencies,
    } = useDriver();

    async function handleAccept() {

        try {

            await acceptEmergency(emergency._id);

            setCurrentEmergency(emergency);

            await AsyncStorage.setItem(
                "currentEmergency",
                JSON.stringify(emergency)
            );

            setIncomingEmergencies(prev =>
                prev.filter(e => e._id !== emergency._id)
            );

            router.replace("/driver/navigation");

        } catch (err) {

            console.log(err);

        }

    }

    async function handleDecline() {

        try {

            await declineEmergency(emergency._id);

            setIncomingEmergencies(prev =>
                prev.filter(e => e._id !== emergency._id)
            );

        } catch (err) {

            console.log(err);

        }

    }

    const ai = emergency.aiAnalysis || {};
    const images = [

        emergency.imageUrl,

        ...(emergency.evidence || []).map(
            e => e.imageUrl
        ),

    ].filter(Boolean);

    const [currentImage, setCurrentImage] =
        useState(0);

    return (
        <View style={styles.card}>

            {images.length > 0 && (

                <View style={styles.imageContainer}>

                    <Image
                        source={{
                            uri: images[currentImage],
                        }}
                        resizeMode="cover"
                        style={styles.image}
                    />

                    {currentImage > 0 && (

                        <TouchableOpacity
                            style={styles.leftArrow}
                            onPress={() =>
                                setCurrentImage(
                                    currentImage - 1
                                )
                            }
                        >
                            <Text style={styles.arrow}>
                                ◀
                            </Text>
                        </TouchableOpacity>

                    )}

                    {currentImage <
                        images.length - 1 && (

                            <TouchableOpacity
                                style={styles.rightArrow}
                                onPress={() =>
                                    setCurrentImage(
                                        currentImage + 1
                                    )
                                }
                            >
                                <Text style={styles.arrow}>
                                    ▶
                                </Text>
                            </TouchableOpacity>

                        )}

                    <View style={styles.counter}>

                        <Text style={styles.counterText}>
                            {currentImage + 1} / {images.length}
                        </Text>

                    </View>

                </View>

            )}

            <View style={styles.titleRow}>

                <Text style={styles.type}>
                    🚨 {ai.predicted_class || emergency.requestType || "Emergency"}
                </Text>

                <View
                    style={[
                        styles.priorityBadge,
                        {
                            backgroundColor:
                                ai.severity === "CRITICAL"
                                    ? "#DC2626"
                                    : ai.severity === "HIGH"
                                        ? "#EA580C"
                                        : ai.severity === "MODERATE"
                                            ? "#2563EB"
                                            : "#16A34A",
                        },
                    ]}
                >
                    <Text style={styles.priorityText}>
                        {ai.severity || "LOW"}
                    </Text>
                </View>

            </View>

            <View style={styles.content}>

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        AI ANALYSIS
                    </Text>

                    <View style={styles.rowItem}>

                        <Text style={styles.left}>
                            Prediction
                        </Text>

                        <Text style={styles.right}>
                            {ai.predicted_class || "-"}
                        </Text>

                    </View>

                    <View style={styles.rowItem}>

                        <Text style={styles.left}>
                            Confidence
                        </Text>

                        <Text style={styles.right}>
                            {Math.round((ai.confidence || 0) * 100)}%
                        </Text>

                    </View>

                    <View style={styles.rowItem}>

                        <Text style={styles.left}>
                            Priority
                        </Text>

                        <Text style={styles.right}>
                            {emergency.priority || "-"}
                        </Text>

                    </View>

                </View>

                <View style={styles.section}>

                    <Text style={styles.sectionTitle}>
                        PATIENT DETAILS
                    </Text>

                    <View style={styles.rowItem}>

                        <Text style={styles.left}>
                            Name
                        </Text>

                        <Text style={styles.right}>
                            {emergency.user?.name || "Anonymous"}
                        </Text>

                    </View>

                    <View style={styles.rowItem}>

                        <Text style={styles.left}>
                            Phone
                        </Text>

                        <Text style={styles.right}>
                            {emergency.user?.mobile || "Not Available"}
                        </Text>

                    </View>

                    <View style={styles.rowItem}>

                        <Text style={styles.left}>
                            Location
                        </Text>

                        <Text
                            style={[
                                styles.right,
                                {
                                    flex: 1,
                                    textAlign: "right",
                                },
                            ]}
                        >
                            {emergency.location?.address ||
                                `${emergency.location?.latitude?.toFixed(5)}, ${emergency.location?.longitude?.toFixed(5)}`}
                        </Text>

                    </View>

                </View>

            </View>

            <View style={styles.buttons}>

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
    );

}

const styles = StyleSheet.create({

    card: {

        backgroundColor: "#FFFFFF",

        borderRadius: 18,

        marginHorizontal: 16,

        marginBottom: 18,

        overflow: "hidden",

        shadowColor: "#000",

        shadowOpacity: 0.12,

        shadowRadius: 10,

        shadowOffset: {

            width: 0,

            height: 4,

        },

        elevation: 6,

    },

    image: {

        width: "100%",

        height: 220,

        borderTopLeftRadius: 18,

        borderTopRightRadius: 18,

    },

    row: {

        flexDirection: "row",

        justifyContent: "space-between",

        paddingHorizontal: 16,

        paddingTop: 14,

    },

    type: {

        fontWeight: "700",

        fontSize: 18,

    },

    badge: {

        backgroundColor: "#DC2626",

        paddingHorizontal: 10,

        paddingVertical: 4,

        borderRadius: 20,

    },

    badgeText: {

        color: "#fff",

        fontWeight: "700",

    },

    patient: {

        paddingHorizontal: 16,

        marginTop: 12,

        fontSize: 16,

        fontWeight: "600",

    },

    location: {

        paddingHorizontal: 16,

        marginTop: 6,

        color: "#6B7280",

    },

    infoRow: {

        flexDirection: "row",

        justifyContent: "space-between",

        paddingHorizontal: 16,

        marginTop: 14,

    },

    buttons: {

        flexDirection: "row",

        padding: 16,

    },

    accept: {

        flex: 1,

        backgroundColor: "#16A34A",

        padding: 15,

        borderRadius: 12,

        alignItems: "center",

        marginRight: 8,

    },

    decline: {

        flex: 1,

        borderWidth: 1,

        borderColor: "#DC2626",

        padding: 15,

        borderRadius: 12,

        alignItems: "center",

        marginLeft: 8,

    },

    acceptText: {

        color: "#fff",

        fontWeight: "700",

    },

    declineText: {

        color: "#DC2626",

        fontWeight: "700",

    },
    titleRow: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        paddingHorizontal: 16,

        paddingTop: 16,

    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 10,
    },

    label: {
        marginTop: 12,
        color: "#6B7280",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
    },

    value: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        marginTop: 2,
    },

    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    priorityText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },
    section: {

        marginHorizontal: 16,

        marginTop: 16,

        padding: 14,

        backgroundColor: "#F9FAFB",

        borderRadius: 12,

    },

    sectionTitle: {

        fontSize: 13,

        fontWeight: "700",

        color: "#6B7280",

        marginBottom: 12,

    },

    rowItem: {

        flexDirection: "row",

        justifyContent: "space-between",

        marginBottom: 10,

    },

    left: {

        color: "#6B7280",

        fontSize: 14,

    },

    right: {

        color: "#111827",

        fontWeight: "600",

        fontSize: 14,

    },
    imageContainer: {

        position: "relative",

    },

    leftArrow: {

        position: "absolute",

        left: 12,

        top: "45%",

        backgroundColor: "rgba(0,0,0,0.5)",

        borderRadius: 25,

        padding: 8,

    },

    rightArrow: {

        position: "absolute",

        right: 12,

        top: "45%",

        backgroundColor: "rgba(0,0,0,0.5)",

        borderRadius: 25,

        padding: 8,

    },

    arrow: {

        color: "#fff",

        fontSize: 22,

        fontWeight: "700",

    },

    counter: {

        position: "absolute",

        bottom: 10,

        alignSelf: "center",

        backgroundColor: "rgba(0,0,0,0.55)",

        paddingHorizontal: 12,

        paddingVertical: 5,

        borderRadius: 15,

    },

    counterText: {

        color: "#fff",

        fontWeight: "700",

    },

});