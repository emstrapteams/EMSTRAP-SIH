import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { getRoutePolyline } from "../../../services/routeService";

export default function LiveMap({ booking }) {
    const mapRef = useRef(null);

    const [driverRoute, setDriverRoute] = useState([]);
    const [tripRoute, setTripRoute] = useState([]);

    if (!booking) return null;

    const pickup = booking.pickupLocation;
    const dropoff = booking.dropoffLocation;
    const ambulance = booking.ambulance?.currentLocation;

    if (
        typeof pickup?.latitude !== "number" ||
        typeof pickup?.longitude !== "number"
    ) {
        return (
            <View style={styles.card}>
                <Text style={styles.heading}>Live Tracking</Text>
                <Text>Pickup location not available.</Text>
            </View>
        );
    }

    useEffect(() => {
        async function loadRoutes() {
            if (
                ambulance &&
                typeof ambulance.latitude === "number" &&
                typeof ambulance.longitude === "number"
            ) {
                const route = await getRoutePolyline(
                    ambulance,
                    pickup
                );
                setDriverRoute(route);
            }

            if (
                dropoff &&
                typeof dropoff.latitude === "number" &&
                typeof dropoff.longitude === "number"
            ) {
                const route = await getRoutePolyline(
                    pickup,
                    dropoff
                );
                setTripRoute(route);
            }
        }

        loadRoutes();

        const coordinates = [
            {
                latitude: pickup.latitude,
                longitude: pickup.longitude,
            },
        ];

        if (ambulance) {
            coordinates.push({
                latitude: ambulance.latitude,
                longitude: ambulance.longitude,
            });
        }

        if (dropoff) {
            coordinates.push({
                latitude: dropoff.latitude,
                longitude: dropoff.longitude,
            });
        }

        mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: {
                top: 80,
                right: 80,
                bottom: 80,
                left: 80,
            },
            animated: true,
        });

    }, [booking]);

    return (
        <View style={styles.card}>
            <Text style={styles.heading}>Live Tracking</Text>

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: pickup.latitude,
                    longitude: pickup.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker
                    coordinate={pickup}
                    title="Pickup"
                    pinColor="red"
                />

                {dropoff && (
                    <Marker
                        coordinate={dropoff}
                        title="Drop-off"
                        pinColor="green"
                    />
                )}

                {ambulance && (
                    <Marker
                        coordinate={ambulance}
                        title="Driver"
                        pinColor="blue"
                    />
                )}

                {driverRoute.length > 0 && (
                    <Polyline
                        coordinates={driverRoute}
                        strokeWidth={5}
                        strokeColor="#22C55E"
                    />
                )}

                {tripRoute.length > 0 && (
                    <Polyline
                        coordinates={tripRoute}
                        strokeWidth={5}
                        strokeColor="#2563EB"
                    />
                )}
            </MapView>
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "red" }]} />
                    <Text style={styles.legendText}>Pickup</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "green" }]} />
                    <Text style={styles.legendText}>Drop-off</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "blue" }]} />
                    <Text style={styles.legendText}>Driver</Text>
                </View>
            </View>
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
    legend: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 14,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },

    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },

    legendText: {
        fontSize: 13,
        color: "#374151",
        fontWeight: "500",
    },
});