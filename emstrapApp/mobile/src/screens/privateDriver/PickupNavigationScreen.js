import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
} from "react-native";

import { useRouter } from "expo-router";

import PrivateDriverHeader from "../../components/privateDriver/PrivateDriverHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DriverMap from "../../components/driver/navigation/DriverMap";
import RouteInfoCard from "../../components/driver/navigation/RouteInfoCard";
import ArrivedButton from "../../components/driver/navigation/ArrivedButton";

import usePrivateNavigation from "../../hooks/privateDriver/usePrivateNavigation";
import { usePrivateDriver } from "../../context/PrivateDriverContext";

import {
    arriveBooking,
} from "../../services/privateBookingService";

export default function PickupNavigationScreen() {

    const router = useRouter();

    const {

        currentBooking,

        setCurrentBooking,

    } = usePrivateDriver();

    console.log("===== PICKUP NAVIGATION =====");
    console.log(currentBooking);

    const {
        driverLocation,
        route,
        distance,
        duration,
    } = usePrivateNavigation(
        currentBooking,
        currentBooking?.pickupLocation
    );

    if (!currentBooking) {

        return (

            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >

                <Text>
                    No Active Booking
                </Text>

            </SafeAreaView>

        );

    }

    const pickup = {

        latitude:
            currentBooking.pickupLocation.latitude,

        longitude:
            currentBooking.pickupLocation.longitude,

    };

    const handleArrived = async () => {

        try {

            await arriveBooking(
                currentBooking._id
            );
            const updated = {

                ...currentBooking,

                status: "ARRIVED",

            };

            setCurrentBooking(updated);

            await AsyncStorage.setItem(
                "currentBooking",
                JSON.stringify(updated)
            );

            router.replace(
                "/privateDriver/drop-navigation"
            );

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <SafeAreaView style={styles.container}>

            <PrivateDriverHeader />

            <RouteInfoCard

                distance={distance}

                duration={duration}

            />

            <View style={styles.mapContainer}>

                {driverLocation && (

                    <DriverMap

                        driverLocation={driverLocation}

                        patient={pickup}

                        route={route}

                    />

                )}

            </View>

            <ArrivedButton
                title="ARRIVED AT PICKUP"
                onPress={handleArrived}
            />

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#F8FAFC",

    },

    mapContainer: {

        flex: 1,

        marginHorizontal: 16,

        marginBottom: 16,

        overflow: "hidden",

        borderRadius: 18,

    },

});