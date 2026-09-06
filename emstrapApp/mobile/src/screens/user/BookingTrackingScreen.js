import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    RefreshControl,
    Text,
} from "react-native";

import useBookingTracking from "../../hooks/user/useBookingTracking";

import LoadingScreen from "../../components/user/booking/LoadingScreen";
import StatusCard from "../../components/user/booking/StatusCard";
import BookingCard from "../../components/user/booking/BookingCard";
import DriverCard from "../../components/user/booking/DriverCard";
import LiveMap from "../../components/user/booking/LiveMap";
import Timeline from "../../components/user/booking/Timeline";
import CancelBookingButton from "../../components/user/booking/CancelBookingButton";

export default function BookingTrackingScreen({
    bookingId,
}) {
    console.log("Booking ID:", bookingId);

    const {

        booking,
        loading,
        refreshing,
        refresh,
        error,

    } = useBookingTracking(bookingId);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text>{error}</Text>
            </SafeAreaView>
        );
    }

    return (

        <SafeAreaView style={styles.container}>

            <ScrollView

                contentContainerStyle={styles.content}

                refreshControl={

                    <RefreshControl

                        refreshing={refreshing}

                        onRefresh={refresh}

                    />

                }

            >

                <StatusCard booking={booking} />

                <BookingCard booking={booking} />

                <DriverCard booking={booking} />

                <LiveMap booking={booking} />

                <Timeline booking={booking} />

                <CancelBookingButton
                    booking={booking}
                    onCancel={refresh}
                />

            </ScrollView>

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },

    content: {
        padding: 16,
        gap: 16,
        paddingBottom: 40,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }

});