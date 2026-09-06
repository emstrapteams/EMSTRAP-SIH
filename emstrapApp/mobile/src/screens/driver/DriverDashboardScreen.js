import React, { useEffect } from "react";
import {
    SafeAreaView,
    StyleSheet,
    View,
    FlatList,
    Text,
} from "react-native";
import * as Location from "expo-location";
import {
    updateDriverStatus,
    getPendingEmergencies,
} from "../../services/driverService";
import EmergencyCard from "../../components/driver/EmergencyCard";
import { useDriver } from "../../context/DriverContext";
import DriverHeader from "../../components/driver/DriverHeader";
import StatusCard from "../../components/driver/StatusCard";
import useDriverSocket from "../../hooks/driver/useDriverSocket";
export default function DriverDashboardScreen() {
    const {
        driver,
        online,
        setOnline,
        incomingEmergencies,
        setIncomingEmergencies,
        startLocationTracking,
        stopLocationTracking,
    } = useDriver();
    useDriverSocket();
    useEffect(() => {

        if (!online) return;

        async function loadPending() {

            try {

                const pending =
                    await getPendingEmergencies();

                setIncomingEmergencies(pending);

            } catch (err) {

                console.log(err);

            }

        }

        loadPending();

    }, [online]);
    const handleStatusToggle = async () => {

        try {

            if (online) {

                await updateDriverStatus("OFFLINE");

                stopLocationTracking();

                setOnline(false);

                setIncomingEmergencies([]);

            } else {

                await updateDriverStatus("LIVE");

                startLocationTracking();

                setOnline(true);

                const pending =
                    await getPendingEmergencies();

                setIncomingEmergencies(pending);

            }

        } catch (err) {

            console.log(err);

        }

    };

    return (

        <SafeAreaView style={styles.container}>

            <FlatList

                data={incomingEmergencies}

                keyExtractor={(item) => item._id}

                ListHeaderComponent={

                    <>

                        <DriverHeader />

                        <StatusCard
                            driver={driver}
                            online={online}
                            onToggle={handleStatusToggle}
                        />

                        <Text style={styles.heading}>
                            Incoming Emergencies
                        </Text>

                    </>

                }

                renderItem={({ item }) => (

                    <EmergencyCard
                        emergency={item}
                    />

                )}

                ListEmptyComponent={

                    <View style={styles.emptyContainer}>

                        <Text style={styles.emptyTitle}>
                            No Incoming Emergencies
                        </Text>

                        <Text style={styles.emptySubtitle}>
                            Stay online to receive new requests.
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
