import React, {
    useEffect,
    useMemo,
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
} from "react-native-maps";

import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";

import HospitalLayout from "../../components/hospital/HospitalLayout";

import {
    API_URL,
    getAlerts,
} from "../../services/api";

export default function HospitalLiveMap() {
    const socketRef = useRef(null);
    const mapRef = useRef(null);

    const [alerts, setAlerts] =
        useState([]);

    const [
        ambulanceLocations,
        setAmbulanceLocations,
    ] = useState({});

    const [
        liveAmbulancesCount,
        setLiveAmbulancesCount,
    ] = useState(0);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const fetchInitialState = async () => {
            try {
                const alertsRes = await getAlerts();

                if (alertsRes?.success) {
                    const activeAlerts =
                        (alertsRes.alerts || []).filter(
                            (alert) =>
                                ![
                                    "COMPLETED",
                                    "CANCELLED",
                                ].includes(alert.status)
                        );

                    setAlerts(activeAlerts);

                    console.log(
                        "HOSPITAL MAP ACTIVE ALERTS:",
                        activeAlerts.length
                    );
                }
            } catch (error) {
                console.log(
                    "HOSPITAL MAP FETCH ERROR:",
                    error?.response?.data ||
                    error?.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchInitialState();



        // Same Socket.IO workflow as web.
        const socket = io(API_URL, {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(
                "HOSPITAL MAP SOCKET CONNECTED:",
                socket.id
            );

            socket.emit(
                "join_hospital",
                {}
            );
        });

        socket.on(
            "hospital_alert",
            (data) => {
                const request =
                    data?.request;

                if (!request?._id) {
                    return;
                }

                setAlerts((previous) => {
                    if (
                        previous.some(
                            (alert) =>
                                alert._id ===
                                request._id
                        )
                    ) {
                        return previous;
                    }

                    return [
                        request,
                        ...previous,
                    ];
                });
            }
        );

        socket.on(
            "ambulance_location",
            (data) => {
                const requestId =
                    data?.requestId;

                const latitude = Number(
                    data?.lat ??
                    data?.latitude
                );

                const longitude = Number(
                    data?.lng ??
                    data?.longitude
                );

                if (
                    !requestId ||
                    !Number.isFinite(
                        latitude
                    ) ||
                    !Number.isFinite(
                        longitude
                    )
                ) {
                    return;
                }

                setAmbulanceLocations(
                    (previous) => ({
                        ...previous,

                        [requestId]: {
                            latitude,
                            longitude,
                        },
                    })
                );
            }
        );

        socket.on(
            "disconnect",
            (reason) => {
                console.log(
                    "HOSPITAL MAP SOCKET DISCONNECTED:",
                    reason
                );
            }
        );

        return () => {


            socket.removeAllListeners();
            socket.disconnect();

            socketRef.current = null;
        };
    }, []);

    const validAlerts = useMemo(
        () =>
            alerts.filter((alert) => {
                const latitude = Number(
                    alert?.location
                        ?.latitude
                );

                const longitude = Number(
                    alert?.location
                        ?.longitude
                );

                return (
                    Number.isFinite(
                        latitude
                    ) &&
                    Number.isFinite(
                        longitude
                    )
                );
            }),
        [alerts]
    );

    const initialRegion = useMemo(() => {
        if (validAlerts.length > 0) {
            return {
                latitude: Number(
                    validAlerts[0]
                        .location.latitude
                ),

                longitude: Number(
                    validAlerts[0]
                        .location.longitude
                ),

                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
            };
        }

        // Same India fallback as web.
        return {
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 20,
            longitudeDelta: 20,
        };
    }, [validAlerts]);

    return (
        <HospitalLayout
            title="Live Operations Map"
            description="Real-time emergency and ambulance tracking"
            scroll={false}
        >
            <View style={styles.container}>
                <View style={styles.mapCard}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={
                            initialRegion
                        }
                        showsCompass
                        showsScale
                    >
                        {validAlerts.map(
                            (alert) => {
                                const patientLat =
                                    Number(
                                        alert
                                            .location
                                            .latitude
                                    );

                                const patientLng =
                                    Number(
                                        alert
                                            .location
                                            .longitude
                                    );

                                const ambulance =
                                    ambulanceLocations[
                                    alert._id
                                    ];

                                return (
                                    <React.Fragment
                                        key={
                                            alert._id
                                        }
                                    >
                                        {/* Patient */}
                                        <Marker
                                            coordinate={{
                                                latitude:
                                                    patientLat,
                                                longitude:
                                                    patientLng,
                                            }}
                                            title={`Patient: ${alert
                                                ?.user
                                                ?.name ||
                                                "Anonymous"
                                                }`}
                                            description={`Status: ${alert.status}`}
                                            pinColor="#2563eb"
                                        />

                                        {/* Live ambulance */}
                                        {ambulance && (
                                            <Marker
                                                coordinate={
                                                    ambulance
                                                }
                                                title={`Ambulance: ${alert
                                                    ?.ambulance
                                                    ?.vehicleNumber ||
                                                    "Fleet"
                                                    }`}
                                                description="Live Tracking Enabled"
                                                pinColor="#dc2626"
                                            />
                                        )}
                                    </React.Fragment>
                                );
                            }
                        )}
                    </MapView>

                    {/* Ambulance counter */}
                    <View
                        style={
                            styles.counterCard
                        }
                    >
                        <View
                            style={
                                styles.counterIcon
                            }
                        >
                            <Ionicons
                                name="car-outline"
                                size={20}
                                color="#ffffff"
                            />
                        </View>

                        <View>
                            <Text
                                style={
                                    styles.counterLabel
                                }
                            >
                                ACTIVE
                                AMBULANCES
                            </Text>

                            <Text
                                style={
                                    styles.counterValue
                                }
                            >
                                {
                                    liveAmbulancesCount
                                }
                            </Text>
                        </View>
                    </View>

                    {/* Legend */}
                    <View
                        style={
                            styles.legend
                        }
                    >
                        <View
                            style={
                                styles.legendRow
                            }
                        >
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            "#dc2626",
                                    },
                                ]}
                            />

                            <Text
                                style={
                                    styles.legendText
                                }
                            >
                                Inbound
                                Ambulance
                            </Text>
                        </View>

                        <View
                            style={
                                styles.legendRow
                            }
                        >
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor:
                                            "#2563eb",
                                    },
                                ]}
                            />

                            <Text
                                style={
                                    styles.legendText
                                }
                            >
                                Patient
                                Location
                            </Text>
                        </View>
                    </View>

                    {loading && (
                        <View
                            style={
                                styles.loadingOverlay
                            }
                        >
                            <ActivityIndicator
                                size="large"
                                color="#dc2626"
                            />

                            <Text
                                style={
                                    styles.loadingText
                                }
                            >
                                Loading live
                                operations...
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </HospitalLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    mapCard: {
        flex: 1,
        overflow: "hidden",

        borderRadius: 18,

        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    counterCard: {
        position: "absolute",

        top: 14,
        left: 14,

        minWidth: 145,

        paddingHorizontal: 13,
        paddingVertical: 11,

        borderRadius: 14,

        backgroundColor:
            "rgba(17,24,39,0.92)",

        flexDirection: "row",
        alignItems: "center",
    },

    counterIcon: {
        width: 36,
        height: 36,

        borderRadius: 10,

        backgroundColor: "#dc2626",

        alignItems: "center",
        justifyContent: "center",

        marginRight: 10,
    },

    counterLabel: {
        fontSize: 8,
        fontWeight: "800",

        color: "#d1d5db",

        letterSpacing: 0.7,
    },

    counterValue: {
        marginTop: 1,

        fontSize: 22,
        fontWeight: "900",

        color: "#ffffff",
    },

    legend: {
        position: "absolute",

        top: 14,
        right: 14,

        padding: 11,

        borderRadius: 13,

        backgroundColor:
            "rgba(17,24,39,0.92)",
    },

    legendRow: {
        flexDirection: "row",
        alignItems: "center",

        marginVertical: 3,
    },

    dot: {
        width: 9,
        height: 9,

        borderRadius: 5,

        marginRight: 7,
    },

    legendText: {
        fontSize: 9,
        fontWeight: "700",

        color: "#e5e7eb",
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,

        alignItems: "center",
        justifyContent: "center",

        backgroundColor:
            "rgba(255,255,255,0.75)",
    },

    loadingText: {
        marginTop: 10,

        fontSize: 13,
        fontWeight: "600",

        color: "#4b5563",
    },
});