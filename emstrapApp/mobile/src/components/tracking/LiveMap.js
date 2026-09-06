import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoutePolyline } from "../../services/routeService";

export default function LiveMap({ emergency }) {
    const mapRef = useRef(null);

    const [driverRoute, setDriverRoute] = useState([]);
    const [hospitalRoute, setHospitalRoute] = useState([]);

    if (!emergency) return null;

    const patient = {
        latitude: emergency.location?.latitude,
        longitude: emergency.location?.longitude,
    };

    const ambulance =
        emergency.ambulance?.liveLocation ||
        emergency.ambulance?.currentLocation;

    const hospital = emergency.hospital?.location;

    if (
        typeof patient.latitude !== "number" ||
        typeof patient.longitude !== "number"
    ) {
        return (
            <View style={styles.card}>
                <Text style={styles.heading}>Live Tracking</Text>
                <Text>Location not available.</Text>
            </View>
        );
    }

    useEffect(() => {
        if (
            ambulance &&
            typeof ambulance.latitude === "number" &&
            typeof ambulance.longitude === "number"
        ) {
            mapRef.current?.animateCamera(
                {
                    center: {
                        latitude: ambulance.latitude,
                        longitude: ambulance.longitude,
                    },
                    zoom: 16,
                },
                { duration: 1000 }
            );
        }
    }, [ambulance]);

    useEffect(() => {
        async function loadRoutes() {
            try {
                if (
                    ambulance &&
                    typeof ambulance.latitude === "number" &&
                    typeof ambulance.longitude === "number"
                ) {
                    const route = await getRoutePolyline(
                        ambulance,
                        patient
                    );
                    setDriverRoute(route || []);
                } else {
                    setDriverRoute([]);
                }

                if (
                    hospital &&
                    typeof hospital.latitude === "number" &&
                    typeof hospital.longitude === "number"
                ) {
                    const route = await getRoutePolyline(
                        patient,
                        hospital
                    );
                    setHospitalRoute(route || []);
                } else {
                    setHospitalRoute([]);
                }
            } catch (err) {
                console.log("Route Error:", err);
            }
        }

        loadRoutes();
    }, [ambulance, hospital, patient.latitude, patient.longitude]);

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>Live Tracking</Text>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: patient.latitude,
                    longitude: patient.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                <Marker
                    coordinate={patient}
                    title="Patient"
                    pinColor="red"
                />

                {ambulance && (
                    <Marker
                        coordinate={{
                            latitude: ambulance.latitude,
                            longitude: ambulance.longitude,
                        }}
                        title="Ambulance"
                        pinColor="blue"
                    />
                )}

                {hospital && (
                    <Marker
                        coordinate={{
                            latitude: hospital.latitude,
                            longitude: hospital.longitude,
                        }}
                        title="Hospital"
                        pinColor="green"
                    />
                )}

                {driverRoute.length > 0 && (
                    <Polyline
                        coordinates={driverRoute}
                        strokeWidth={5}
                        strokeColor="#22C55E"
                    />
                )}

                {hospitalRoute.length > 0 && (
                    <Polyline
                        coordinates={hospitalRoute}
                        strokeWidth={5}
                        strokeColor="#2563EB"
                    />
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        elevation: 3,
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 16,
        color: "#111827",
    },

    map: {
        width: "100%",
        height: 320,
        borderRadius: 12,
    },
});