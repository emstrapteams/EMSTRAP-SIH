import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import PrivateDriverHeader from "../../components/privateDriver/PrivateDriverHeader";

import DriverMap from "../../components/driver/navigation/DriverMap";
import RouteInfoCard from "../../components/driver/navigation/RouteInfoCard";
import CompleteTripButton from "../../components/driver/navigation/CompleteTripButton";

import usePrivateNavigation from "../../hooks/privateDriver/usePrivateNavigation";
import { usePrivateDriver } from "../../context/PrivateDriverContext";

import {
    completeBooking,
    startBookingTrip,
} from "../../services/privateBookingService";

export default function DropNavigationScreen() {

    const router = useRouter();

    const {

        currentBooking,

        setCurrentBooking,

    } = usePrivateDriver();

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

    const {

        driverLocation,

        route,

        distance,

        duration,

    } = usePrivateNavigation(

        currentBooking,

        currentBooking?.dropoffLocation

    );

    const destination = {

        latitude:
            currentBooking.dropoffLocation.latitude,

        longitude:
            currentBooking.dropoffLocation.longitude,

    };

    async function handleComplete() {

        try {

            await completeBooking(
                currentBooking._id
            );

            await AsyncStorage.removeItem(
                "currentBooking"
            );

            setCurrentBooking(null);

            router.replace(
                "/privateDriver"
            );

        } catch (err) {

            console.log(err);

        }

    }

    React.useEffect(() => {

        async function startTrip() {

            try {

                await startBookingTrip(
                    currentBooking._id
                );
                const updated = {

                    ...currentBooking,

                    status: "IN_PROGRESS",

                };

                setCurrentBooking(updated);

                await AsyncStorage.setItem(
                    "currentBooking",
                    JSON.stringify(updated)
                );

            } catch (err) {

                console.log(err);

            }

        }

        startTrip();

    }, []);

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

                        patient={destination}

                        route={route}

                    />

                )}

            </View>

            <CompleteTripButton
                title="COMPLETE RIDE"
                onPress={handleComplete}
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