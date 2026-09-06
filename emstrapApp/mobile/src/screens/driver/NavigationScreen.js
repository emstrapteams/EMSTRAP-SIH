import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
} from "react-native";
import { useRouter } from "expo-router";

import DriverHeader from "../../components/driver/DriverHeader";

import DriverMap from "../../components/driver/navigation/DriverMap";
import RouteInfoCard from "../../components/driver/navigation/RouteInfoCard";
import ArrivedButton from "../../components/driver/navigation/ArrivedButton";

import useDriverNavigation from "../../hooks/driver/useDriverNavigation";

import { useDriver } from "../../context/DriverContext";

import {
    markArrived,
} from "../../services/driverEmergencyService";

export default function NavigationScreen() {

    const router = useRouter();

    const {
        currentEmergency,
    } = useDriver();
    console.log("===== NAVIGATION SCREEN =====");
    console.log(currentEmergency);
    const {

        driverLocation,

        route,

        distance,

        duration,

    } = useDriverNavigation(currentEmergency);

    if (!currentEmergency) {
        console.log("❌ currentEmergency is NULL");

        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>No current emergency</Text>
            </SafeAreaView>
        );
    }

    const patient = {

        latitude:
            currentEmergency.location.latitude,

        longitude:
            currentEmergency.location.longitude,

    };

    const handleArrived = async () => {

        try {

            await markArrived(
                currentEmergency._id
            );

            router.replace(
                "/driver/hospital"
            );

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <SafeAreaView style={styles.container}>

            <DriverHeader />

            <RouteInfoCard
                distance={distance}
                duration={duration}
            />

            <View style={styles.mapContainer}>

                {driverLocation && (
                    <DriverMap
                        driverLocation={driverLocation}
                        patient={patient}
                        route={route}
                    />
                )}

            </View>

            <ArrivedButton
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