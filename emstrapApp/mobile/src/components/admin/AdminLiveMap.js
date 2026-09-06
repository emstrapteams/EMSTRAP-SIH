import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";

import MapView, {
    Marker,
    PROVIDER_GOOGLE,
} from "react-native-maps";

import { io } from "socket.io-client";

import { API_URL } from "../../services/api";

const DEFAULT_REGION = {
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
};

export default function AdminLiveMap({
    emergencies = [],
    bookings = [],
}) {
    const mapRef = useRef(null);
    const socketRef = useRef(null);

    const [ambulanceLocations, setAmbulanceLocations] =
        useState({});

    const [patientLocations, setPatientLocations] =
        useState({});

    const [mapReady, setMapReady] = useState(false);

    // -------------------------------------------
    // SOCKET CONNECTION
    // -------------------------------------------

    useEffect(() => {
        const socket = io(API_URL, {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(
                "ADMIN MAP SOCKET CONNECTED:",
                socket.id
            );

            emergencies.forEach((item) => {
                if (!item?._id) return;

                console.log(
                    "TRACKING EMERGENCY:",
                    item._id
                );

                socket.emit("track_request", {
                    requestId: item._id,
                });
            });

            bookings.forEach((item) => {
                if (!item?._id) return;

                console.log(
                    "TRACKING BOOKING:",
                    item._id
                );

                socket.emit("track_request", {
                    requestId: item._id,
                });
            });
        });

        socket.on("connect_error", (error) => {
            console.log(
                "ADMIN MAP SOCKET ERROR:",
                error.message
            );

            console.log(
                "SOCKET ERROR DESCRIPTION:",
                error.description
            );

            console.log(
                "SOCKET ERROR CONTEXT:",
                error.context
            );
        });

        socket.on("ambulance_location", (data) => {
            console.log(
                "AMBULANCE LOCATION EVENT:",
                JSON.stringify(data, null, 2)
            );

            const id =
                data?.emergencyId ||
                data?.bookingId ||
                data?.requestId;

            const latitude = Number(
                data?.latitude ??
                data?.lat ??
                data?.location?.latitude ??
                data?.location?.lat
            );

            const longitude = Number(
                data?.longitude ??
                data?.lng ??
                data?.location?.longitude ??
                data?.location?.lng
            );

            console.log(
                "AMBULANCE PARSED:",
                id,
                latitude,
                longitude
            );

            if (
                !id ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                console.log(
                    "INVALID AMBULANCE LOCATION:",
                    data
                );

                return;
            }

            setAmbulanceLocations((prev) => ({
                ...prev,
                [id]: {
                    latitude,
                    longitude,
                },
            }));
        });

        socket.on("user_location", (data) => {
            const id =
                data?.emergencyId ||
                data?.bookingId ||
                data?.requestId;

            const latitude = Number(
                data?.latitude ?? data?.lat
            );

            const longitude = Number(
                data?.longitude ?? data?.lng
            );

            if (
                !id ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {
                return;
            }

            setPatientLocations((prev) => ({
                ...prev,

                [id]: {
                    latitude,
                    longitude,
                },
            }));
        });

        return () => {
            socket.off("ambulance_location");
            socket.off("user_location");
            socket.disconnect();
        };
    }, [emergencies, bookings]);

    // -------------------------------------------
    // INITIAL PATIENT LOCATIONS
    // -------------------------------------------

    const getPatientLocation = (item) => {
        const live = patientLocations[item._id];

        if (live) {
            return live;
        }

        const latitude = Number(
            item?.location?.latitude ??
            item?.latitude ??
            item?.userLocation?.latitude ??
            item?.userLocation?.lat
        );

        const longitude = Number(
            item?.location?.longitude ??
            item?.longitude ??
            item?.userLocation?.longitude ??
            item?.userLocation?.lng
        );

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        return {
            latitude,
            longitude,
        };
    };

    const getAmbulanceLocation = (item) => {
        // Prefer live Socket.IO location
        const live = ambulanceLocations[item._id];

        if (live) {
            return live;
        }

        // Otherwise use ambulance's last known location from MongoDB
        const latitude = Number(
            item?.ambulance?.currentLocation?.latitude ??
            item?.ambulance?.currentLocation?.lat
        );

        const longitude = Number(
            item?.ambulance?.currentLocation?.longitude ??
            item?.ambulance?.currentLocation?.lng
        );

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return null;
        }

        return {
            latitude,
            longitude,
        };
    };

    // -------------------------------------------
    // FIT MAP TO MARKERS
    // -------------------------------------------

    useEffect(() => {
        if (!mapReady || !mapRef.current) {
            return;
        }

        const coordinates = [];

        emergencies.forEach((item) => {
            const location = getPatientLocation(item);

            if (location) {
                coordinates.push(location);
            }

            const ambulanceLocation =
                getAmbulanceLocation(item);

            if (ambulanceLocation) {
                coordinates.push(ambulanceLocation);
            }
        });

        bookings.forEach((item) => {
            const location = getPatientLocation(item);

            if (location) {
                coordinates.push(location);
            }

            const ambulanceLocation =
                getAmbulanceLocation(item);

            if (ambulanceLocation) {
                coordinates.push(ambulanceLocation);
            }
        });
        if (coordinates.length > 0) {
            mapRef.current.fitToCoordinates(
                coordinates,
                {
                    edgePadding: {
                        top: 70,
                        right: 70,
                        bottom: 70,
                        left: 70,
                    },

                    animated: true,
                }
            );
        }
    }, [
        mapReady,
        emergencies,
        bookings,
        ambulanceLocations,
        patientLocations,
    ]);

    // -------------------------------------------
    // MARKERS
    // -------------------------------------------

    const renderMarkers = (
        items,
        type
    ) =>
        items.map((item) => {
            const patient =
                getPatientLocation(item);

            const ambulance =
                getAmbulanceLocation(item);

            return (
                <React.Fragment
                    key={`${type}-${item._id}`}
                >
                    {patient && (
                        <Marker
                            coordinate={patient}
                            pinColor="#ef4444"
                            title={
                                type === "emergency"
                                    ? "Emergency Patient"
                                    : "Booking Patient"
                            }
                            description={
                                item?.address ||
                                item?.location?.address ||
                                "Patient location"
                            }
                        />
                    )}

                    {ambulance && (
                        <Marker
                            coordinate={ambulance}
                            pinColor="#2563eb"
                            title="Ambulance"
                            description="Live ambulance location"
                        />
                    )}
                </React.Fragment>
            );
        });

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>
                        Live Operations Map
                    </Text>

                    <Text style={styles.subtitle}>
                        Active emergency and ambulance
                        locations
                    </Text>
                </View>

                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />

                    <Text style={styles.liveText}>
                        LIVE
                    </Text>
                </View>
            </View>

            <View style={styles.mapContainer}>
                {!mapReady && (
                    <View style={styles.loading}>
                        <ActivityIndicator
                            size="large"
                            color="#2563eb"
                        />
                    </View>
                )}

                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={DEFAULT_REGION}
                    onMapReady={() =>
                        setMapReady(true)
                    }
                >
                    {renderMarkers(
                        emergencies,
                        "emergency"
                    )}

                    {renderMarkers(
                        bookings,
                        "booking"
                    )}
                </MapView>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#ef4444",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Patient
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#2563eb",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Ambulance
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginTop: 18,

        elevation: 2,

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },

    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

    subtitle: {
        marginTop: 4,
        color: "#9ca3af",
        fontSize: 12,
    },

    liveBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#dcfce7",

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 20,
    },

    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,

        backgroundColor: "#16a34a",

        marginRight: 5,
    },

    liveText: {
        color: "#15803d",
        fontWeight: "800",
        fontSize: 11,
    },

    mapContainer: {
        height: 350,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#e5e7eb",
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    loading: {
        ...StyleSheet.absoluteFillObject,

        justifyContent: "center",
        alignItems: "center",

        zIndex: 10,

        backgroundColor: "#f9fafb",
    },

    legend: {
        flexDirection: "row",
        marginTop: 14,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 20,
    },

    legendDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        marginRight: 6,
    },

    legendText: {
        color: "#6b7280",
        fontSize: 12,
        fontWeight: "600",
    },
});