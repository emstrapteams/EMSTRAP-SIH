import React from "react";
import {
    SafeAreaView,
    FlatList,
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import { useDriver } from "../../context/DriverContext";

import useAvailableHospitals from "../../hooks/driver/useAvailableHospitals";

import {
    assignHospital,
} from "../../services/driverEmergencyService";

export default function HospitalSelectionScreen() {

    const router = useRouter();

    const {
        currentEmergency,
        setCurrentEmergency,
    } = useDriver();

    const {
        hospitals,
        loading,
    } = useAvailableHospitals();
    async function handleSelect(hospital) {

        try {

            const response = await assignHospital(
                currentEmergency._id,
                hospital._id
            );

            console.log("ASSIGN RESPONSE");
            console.log(response);

            setCurrentEmergency(response.data);

            router.replace("/driver/hospital-navigation");

        } catch (err) {

            console.log(err);

        }

    }

    if (loading) {

        return (

            <SafeAreaView style={styles.center}>

                <ActivityIndicator
                    size="large"
                    color="#DC2626"
                />

            </SafeAreaView>

        );

    }

    return (

        <SafeAreaView style={styles.container}>

            <Text style={styles.heading}>

                Select Destination Hospital

            </Text>

            <FlatList

                data={hospitals}

                keyExtractor={(item) => item._id}

                renderItem={({ item }) => (

                    <View style={styles.card}>

                        <Text style={styles.name}>

                            {item.name}

                        </Text>

                        <Text style={styles.address}>

                            {item.address}

                        </Text>

                        <Text style={styles.beds}>

                            Emergency Beds :
                            {" "}
                            {item.emergencyBeds}

                        </Text>

                        <TouchableOpacity

                            style={styles.button}

                            onPress={() =>
                                handleSelect(item)
                            }

                        >

                            <Text style={styles.buttonText}>

                                SELECT

                            </Text>

                        </TouchableOpacity>

                    </View>

                )}

            />

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#EEF5FF",

        padding: 16,

    },

    center: {

        flex: 1,

        justifyContent: "center",

        alignItems: "center",

    },

    heading: {

        fontSize: 28,

        fontWeight: "700",

        color: "#1E3A8A",

        marginBottom: 6,

    },

    subHeading: {

        color: "#64748B",

        fontSize: 15,

        marginBottom: 20,

    },

    card: {

        backgroundColor: "#FFFFFF",

        borderRadius: 20,

        padding: 18,

        marginBottom: 18,

        shadowColor: "#000",

        shadowOpacity: 0.08,

        shadowRadius: 10,

        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 5,

    },

    name: {

        fontSize: 20,

        fontWeight: "700",

        color: "#111827",

    },

    address: {

        marginTop: 8,

        color: "#64748B",

        lineHeight: 22,

    },

    beds: {

        marginTop: 10,

        fontWeight: "600",

        color: "#16A34A",

    },

    button: {

        marginTop: 16,

        backgroundColor: "#2563EB",

        padding: 14,

        borderRadius: 12,

        alignItems: "center",

    },

    buttonText: {

        color: "#FFFFFF",

        fontWeight: "700",

        fontSize: 16,

    },

});