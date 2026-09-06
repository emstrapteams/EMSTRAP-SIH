import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DriverHeader from "../../components/driver/DriverHeader";

import DriverMap from "../../components/driver/navigation/DriverMap";

import RouteInfoCard from "../../components/driver/navigation/RouteInfoCard";

import CompleteTripButton from "../../components/driver/navigation/CompleteTripButton";

import useDriverNavigation from "../../hooks/driver/useDriverNavigation";
import { useDriver } from "../../context/DriverContext";

import {
    completeEmergency,
} from "../../services/driverEmergencyService";

export default function HospitalNavigationScreen() {

    const router = useRouter();

    const {
        currentEmergency,
        setCurrentEmergency,
    } = useDriver();

    const {

        driverLocation,

        route,

        distance,

        duration,

    } = useDriverNavigation(
        currentEmergency,
        currentEmergency?.hospital?.location
    );

    if (
        !currentEmergency ||
        !currentEmergency.hospital
    ) {
        return null;
    }

    const hospital =
        currentEmergency?.hospital?.location;

    async function handleComplete() {

        try {

            await completeEmergency(
                currentEmergency._id
            );
            await AsyncStorage.removeItem(
                "currentEmergency"
            );

            setCurrentEmergency(null);

            router.replace("/driver");

        } catch (err) {

            console.log(err);

        }

    }

    return (

        <SafeAreaView style={styles.container}>

            <DriverHeader />

            <RouteInfoCard

                distance={distance}

                duration={duration}

            />

            <View style={styles.mapContainer}>

                <DriverMap

                    driverLocation={driverLocation}

                    patient={hospital}

                    route={route}

                />

            </View>

            <CompleteTripButton
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

        margin: 16,

        overflow: "hidden",

        borderRadius: 20,

    },

});