import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import {
    acceptBooking,
    declineBooking,
} from "../../services/privateBookingService";

import { usePrivateDriver } from "../../context/PrivateDriverContext";

export default function BookingCard({ booking }) {

    const router = useRouter();

    const {

        setCurrentBooking,

        setIncomingBookings,

    } = usePrivateDriver();
    async function handleAccept() {

        try {

            const acceptedBooking =
                await acceptBooking(
                    booking._id
                );
            console.log("==============");
            console.log("ACCEPTED BOOKING");
            console.log(JSON.stringify(acceptedBooking, null, 2));
            console.log("==============");

            setCurrentBooking(
                acceptedBooking
            );

            await AsyncStorage.setItem(
                "currentBooking",
                JSON.stringify(acceptedBooking)
            );

            setIncomingBookings(prev =>
                prev.filter(
                    b => b._id !== booking._id
                )
            );

            router.replace(
                "/privateDriver/pickup-navigation"
            );

        } catch (err) {

            console.log(err);

        }

    }
    async function handleDecline() {

        try {

            await declineBooking(booking._id);

            setIncomingBookings(prev =>
                prev.filter(
                    b => b._id !== booking._id
                )
            );

        } catch (err) {

            console.log(err);

        }

    }

    return (

        <View style={styles.card}>

            <View style={styles.header}>

                <Text style={styles.title}>
                    🚖 New Ride Request
                </Text>

                <View style={styles.badge}>

                    <Text style={styles.badgeText}>
                        BOOKING
                    </Text>

                </View>

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    PASSENGER
                </Text>

                <View style={styles.rowItem}>

                    <Text style={styles.left}>
                        Name
                    </Text>

                    <Text style={styles.right}>
                        {booking.user?.name || "Passenger"}
                    </Text>

                </View>

                <View style={styles.rowItem}>

                    <Text style={styles.left}>
                        Phone
                    </Text>

                    <Text style={styles.right}>
                        {booking.user?.mobile || "-"}
                    </Text>

                </View>

            </View>

            <View style={styles.section}>

                <Text style={styles.sectionTitle}>
                    TRIP DETAILS
                </Text>

                <View style={styles.rowItem}>

                    <Text style={styles.left}>
                        Pickup
                    </Text>

                    <Text style={styles.right}>
                        {booking.pickupLocation?.address || "Current Location"}
                    </Text>

                </View>

                <View style={styles.rowItem}>

                    <Text style={styles.left}>
                        Drop
                    </Text>

                    <Text style={styles.right}>
                        {booking.dropoffLocation?.address || "-"}
                    </Text>

                </View>

                <View style={styles.rowItem}>
                    <Text style={styles.left}>
                        Distance
                    </Text>

                    <Text style={styles.right}>
                        {booking.distanceKm
                            ? `${booking.distanceKm} km`
                            : "-"}
                    </Text>
                </View>

                <View style={styles.rowItem}>
                    <Text style={styles.left}>
                        Fare
                    </Text>

                    <Text style={styles.right}>
                        {booking.estimatedPrice
                            ? `₹${booking.estimatedPrice}`
                            : "-"}
                    </Text>
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

        shadowColor: "#000",

        shadowOpacity: 0.12,

        shadowRadius: 10,

        shadowOffset: {

            width: 0,

            height: 4,

        },

        elevation: 6,

        overflow: "hidden",

    },

    header: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        padding: 16,

    },

    title: {

        fontSize: 19,

        fontWeight: "700",

        color: "#111827",

    },

    badge: {

        backgroundColor: "#2563EB",

        paddingHorizontal: 12,

        paddingVertical: 5,

        borderRadius: 20,

    },

    badgeText: {

        color: "#FFFFFF",

        fontWeight: "700",

        fontSize: 12,

    },

    section: {

        marginHorizontal: 16,

        marginBottom: 14,

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

        flex: 1,

        textAlign: "right",

        marginLeft: 20,

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

        color: "#FFFFFF",

        fontWeight: "700",

    },

    declineText: {

        color: "#DC2626",

        fontWeight: "700",

    },

});