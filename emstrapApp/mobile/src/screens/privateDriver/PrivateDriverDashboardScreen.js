import React from "react";
import { useRouter } from "expo-router";
import {
    SafeAreaView,
    StyleSheet,
    View,
    FlatList,
    Text,
} from "react-native";
import { useEffect } from "react";
import {
    updateDriverStatus,
    getPendingBookings,
} from "../../services/privateDriverService";

import BookingCard from "../../components/privateDriver/BookingCard";

import { usePrivateDriver } from "../../context/PrivateDriverContext";

import PrivateDriverHeader from "../../components/privateDriver/PrivateDriverHeader";

import StatusCard from "../../components/privateDriver/StatusCard";

import usePrivateDriverSocket from "../../hooks/privateDriver/usePrivateDriverSocket";

export default function PrivateDriverDashboardScreen() {
    const router = useRouter();
    const {

        driver,

        online,

        setOnline,

        incomingBookings,

        setIncomingBookings,

        currentBooking,

        tripStatus,

        startLocationTracking,

        stopLocationTracking,

    } = usePrivateDriver();

    usePrivateDriverSocket();
    useEffect(() => {

        if (!online) return;

        async function loadPending() {

            try {

                const pending =
                    await getPendingBookings();

                setIncomingBookings(pending);

            } catch (err) {

                console.log(err);

            }

        }

        loadPending();

    }, [online]);
    useEffect(() => {

        if (!currentBooking)
            return;

        switch (tripStatus) {

            case "TO_PICKUP":
                router.replace("/privateDriver/pickup-navigation");
                break;

            case "AT_PICKUP":
            case "TO_DESTINATION":
                router.replace("/privateDriver/drop-navigation");
                break;

        }

    }, [currentBooking, tripStatus]);
    const handleStatusToggle = async () => {

        try {

            if (online) {

                await updateDriverStatus("OFFLINE");

                stopLocationTracking();

                setOnline(false);

                setIncomingBookings([]);

            } else {

                await updateDriverStatus("LIVE");

                startLocationTracking();

                setOnline(true);

                const pending =
                    await getPendingBookings();

                setIncomingBookings(pending);

            }

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <SafeAreaView style={styles.container}>

            <FlatList

                data={incomingBookings}

                keyExtractor={(item) => item._id}

                ListHeaderComponent={

                    <>

                        <PrivateDriverHeader />

                        <StatusCard
                            driver={driver}
                            online={online}
                            onToggle={handleStatusToggle}
                        />

                        <Text style={styles.heading}>
                            Incoming Bookings
                        </Text>

                    </>

                }

                renderItem={({ item }) => (

                    <BookingCard
                        booking={item}
                    />

                )}

                ListEmptyComponent={

                    <View style={styles.emptyContainer}>


                        <Text style={styles.emptyTitle}>
                            No Incoming Bookings
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            Stay online to receive ride requests.
                        </Text>

                    </View>

                }

                contentContainerStyle={{
                    paddingBottom: 40,
                }}

            />

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#F8FAFC",

    },

    heading: {

        fontSize: 22,

        fontWeight: "700",

        marginHorizontal: 16,

        marginTop: 20,

        marginBottom: 16,

    },

    emptyContainer: {

        alignItems: "center",

        marginTop: 60,

        paddingHorizontal: 20,

    },

    emptyIcon: {

        fontSize: 60,

    },

    emptyTitle: {

        fontSize: 22,

        fontWeight: "700",

        marginTop: 16,

    },

    emptySubtitle: {

        marginTop: 8,

        color: "#6B7280",

        textAlign: "center",

    },

});