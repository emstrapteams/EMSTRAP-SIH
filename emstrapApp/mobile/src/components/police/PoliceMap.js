import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import MapView, {
    Marker,
    PROVIDER_GOOGLE,
} from "react-native-maps";

import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";
import { API_URL } from "../../services/api";
const DEFAULT_REGION = {
    latitude: 12.9716,
    longitude: 77.5946,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
};

function getCoordinates(item) {
    const location = item?.location;

    if (!location) return null;

    const latitude = Number(
        location.latitude ??
        location.lat
    );

    const longitude = Number(
        location.longitude ??
        location.lng ??
        location.lon
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
}

function getStatusConfig(status) {
    switch (
    String(status || "").toUpperCase()
    ) {
        case "PENDING":
            return {
                label: "Pending",
                color: "#f59e0b",
            };

        case "AMBULANCE_ACCEPTED":
            return {
                label: "In Progress",
                color: "#ef4444",
            };

        case "COMPLETED":
            return {
                label: "Resolved",
                color: "#16a34a",
            };

        case "CANCELLED":
            return {
                label: "Cancelled",
                color: "#64748b",
            };

        default:
            return {
                label: status || "Unknown",
                color: "#6366f1",
            };
    }
}

export default function PoliceMap({
    cases = [],
    onDetails,
    onTrack,
}) {
    const mapRef = useRef(null);
    const socketRef = useRef(null);
    const [mapReady, setMapReady] =
        useState(false);
    const [ambulanceLocations, setAmbulanceLocations] =
        useState({});
    const [selectedCase, setSelectedCase] =
        useState(null);

    const casesWithLocation = useMemo(
        () =>
            cases
                .map((item) => ({
                    item,
                    coordinate:
                        getCoordinates(item),
                }))
                .filter(
                    (entry) =>
                        entry.coordinate !== null
                ),
        [cases]
    );

    const getAmbulanceLocation = (item) => {
        // First use live Socket.IO position
        const live =
            ambulanceLocations[item._id];

        if (live) {
            return live;
        }

        // Otherwise use last MongoDB position
        const latitude = Number(
            item?.ambulance?.currentLocation
                ?.latitude ??
            item?.ambulance?.currentLocation
                ?.lat
        );

        const longitude = Number(
            item?.ambulance?.currentLocation
                ?.longitude ??
            item?.ambulance?.currentLocation
                ?.lng
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

    useEffect(() => {
        console.log(
            "POLICE MAP SOCKET EFFECT STARTED",
            API_URL
        );
        const socket = io(API_URL, {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log(
                "POLICE MAP SOCKET CONNECTED:",
                socket.id
            );

            cases.forEach((item) => {
                if (!item?._id) return;

                console.log(
                    "POLICE TRACKING EMERGENCY:",
                    item._id
                );

                socket.emit("track_request", {
                    requestId: item._id,
                });
            });
        });

        socket.on("connect_error", (error) => {
            console.log(
                "POLICE MAP SOCKET ERROR:",
                error.message
            );
        });

        socket.on(
            "ambulance_location",
            (data) => {
                console.log(
                    "POLICE AMBULANCE LOCATION:",
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
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

                if (
                    !id ||
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    return;
                }

                setAmbulanceLocations(
                    (previous) => ({
                        ...previous,

                        [id]: {
                            latitude,
                            longitude,
                        },
                    })
                );
            }
        );

        return () => {
            socket.off(
                "ambulance_location"
            );

            socket.disconnect();
        };
    }, [cases]);
    useEffect(() => {
        if (
            !mapReady ||
            !mapRef.current ||
            casesWithLocation.length === 0
        ) {
            return;
        }

        const coordinates =
            casesWithLocation.map(
                (entry) => entry.coordinate
            );

        if (coordinates.length === 1) {
            mapRef.current.animateToRegion(
                {
                    ...coordinates[0],
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                },
                500
            );

            return;
        }

        mapRef.current.fitToCoordinates(
            coordinates,
            {
                edgePadding: {
                    top: 60,
                    right: 60,
                    bottom: 60,
                    left: 60,
                },

                animated: true,
            }
        );
    }, [
        mapReady,
        casesWithLocation,
    ]);

    const canTrack = (item) =>
        !!item?.ambulance &&
        ![
            "COMPLETED",
            "CANCELLED",
            "RESOLVED",
        ].includes(
            String(
                item?.status || ""
            ).toUpperCase()
        );

    return (
        <View style={styles.wrapper}>
            <View style={styles.headingRow}>
                <View style={styles.headingText}>
                    <Text style={styles.title}>
                        Emergency Map
                    </Text>

                    <Text style={styles.subtitle}>
                        Live overview of reported cases
                    </Text>
                </View>

                <View style={styles.liveBadge}>
                    <View
                        style={styles.liveDot}
                    />

                    <Text style={styles.liveText}>
                        LIVE
                    </Text>
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#f59e0b",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Pending
                    </Text>
                </View>

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
                        In Progress
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#16a34a",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Resolved
                    </Text>
                </View>
            </View>

            <View style={styles.mapCard}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={DEFAULT_REGION}
                    onMapReady={() =>
                        setMapReady(true)
                    }
                >
                    {casesWithLocation.map(
                        ({
                            item,
                            coordinate,
                        }) => {
                            const status =
                                getStatusConfig(
                                    item.status
                                );

                            return (
                                <Marker
                                    key={item._id}
                                    coordinate={
                                        coordinate
                                    }
                                    onPress={() =>
                                        setSelectedCase(
                                            item
                                        )
                                    }
                                >
                                    <View
                                        style={[
                                            styles.markerOuter,
                                            {
                                                borderColor:
                                                    status.color,
                                            },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.markerInner,
                                                {
                                                    backgroundColor:
                                                        status.color,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="warning"
                                                size={17}
                                                color="#ffffff"
                                            />
                                        </View>
                                    </View>
                                </Marker>
                            );
                        }
                    )}
                    {/* LIVE AMBULANCE MARKERS */}

                    {cases.map((item) => {
                        const ambulanceLocation =
                            getAmbulanceLocation(item);

                        if (!ambulanceLocation) {
                            return null;
                        }

                        return (
                            <Marker
                                key={`ambulance-${item._id}`}
                                coordinate={ambulanceLocation}
                                title="Ambulance"
                                description="Live ambulance location"
                            >
                                <View style={styles.ambulanceMarker}>
                                    <Ionicons
                                        name="car"
                                        size={19}
                                        color="#ffffff"
                                    />
                                </View>
                            </Marker>
                        );
                    })}
                </MapView>

                <View style={styles.mapCount}>
                    <Ionicons
                        name="location"
                        size={15}
                        color="#2563eb"
                    />

                    <Text style={styles.mapCountText}>
                        {
                            casesWithLocation.length
                        }{" "}
                        cases
                    </Text>
                </View>
            </View>

            {selectedCase && (
                <View style={styles.selectedCard}>
                    <View
                        style={
                            styles.selectedTopRow
                        }
                    >
                        <View
                            style={
                                styles.selectedIcon
                            }
                        >
                            <Ionicons
                                name="warning"
                                size={20}
                                color="#dc2626"
                            />
                        </View>

                        <View
                            style={
                                styles.selectedTitleArea
                            }
                        >
                            <Text
                                style={
                                    styles.selectedTitle
                                }
                            >
                                {selectedCase
                                    ?.aiAnalysis
                                    ?.predictedClass ||
                                    selectedCase
                                        ?.requestType ||
                                    "Emergency"}
                            </Text>

                            <Text
                                style={
                                    styles.selectedReference
                                }
                            >
                                Ref:{" "}
                                {selectedCase?._id
                                    ?.slice(-8)}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={
                                styles.closeButton
                            }
                            onPress={() =>
                                setSelectedCase(
                                    null
                                )
                            }
                        >
                            <Ionicons
                                name="close"
                                size={19}
                                color="#6b7280"
                            />
                        </TouchableOpacity>
                    </View>

                    <View
                        style={
                            styles.selectedDetails
                        }
                    >
                        <View
                            style={
                                styles.detailItem
                            }
                        >
                            <Text
                                style={
                                    styles.detailLabel
                                }
                            >
                                Status
                            </Text>

                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color:
                                            getStatusConfig(
                                                selectedCase.status
                                            ).color,
                                    },
                                ]}
                            >
                                {
                                    getStatusConfig(
                                        selectedCase.status
                                    ).label
                                }
                            </Text>
                        </View>

                        <View
                            style={
                                styles.detailItem
                            }
                        >
                            <Text
                                style={
                                    styles.detailLabel
                                }
                            >
                                Severity
                            </Text>

                            <Text
                                style={
                                    styles.detailValue
                                }
                            >
                                {selectedCase
                                    ?.aiAnalysis
                                    ?.severity ||
                                    "N/A"}
                            </Text>
                        </View>

                        <View
                            style={
                                styles.detailItem
                            }
                        >
                            <Text
                                style={
                                    styles.detailLabel
                                }
                            >
                                Ambulance
                            </Text>

                            <Text
                                style={
                                    styles.detailValue
                                }
                                numberOfLines={1}
                            >
                                {selectedCase
                                    ?.ambulance
                                    ?.name ||
                                    "Not assigned"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={
                                styles.detailsButton
                            }
                            onPress={() =>
                                onDetails?.(
                                    selectedCase
                                )
                            }
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={17}
                                color="#2563eb"
                            />

                            <Text
                                style={
                                    styles.detailsText
                                }
                            >
                                Details
                            </Text>
                        </TouchableOpacity>

                        {canTrack(
                            selectedCase
                        ) && (
                                <TouchableOpacity
                                    style={
                                        styles.trackButton
                                    }
                                    onPress={() =>
                                        onTrack?.(
                                            selectedCase
                                        )
                                    }
                                >
                                    <Ionicons
                                        name="navigate-outline"
                                        size={17}
                                        color="#7c3aed"
                                    />

                                    <Text
                                        style={
                                            styles.trackText
                                        }
                                    >
                                        Live Track
                                    </Text>
                                </TouchableOpacity>
                            )}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 24,
        marginBottom: 10,
    },

    headingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    headingText: {
        flex: 1,
    },

    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: "#6b7280",
    },

    liveBadge: {
        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "#ecfdf5",

        paddingHorizontal: 10,
        paddingVertical: 6,

        borderRadius: 20,
    },

    liveDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#16a34a",
        marginRight: 6,
    },

    liveText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#16a34a",
    },

    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 14,

        marginTop: 14,
        marginBottom: 12,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },

    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },

    legendText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#6b7280",
    },

    mapCard: {
        height: 360,

        borderRadius: 18,
        overflow: "hidden",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        backgroundColor: "#e5e7eb",
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    mapCount: {
        position: "absolute",
        top: 12,
        left: 12,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor:
            "rgba(255,255,255,0.95)",

        paddingHorizontal: 10,
        paddingVertical: 7,

        borderRadius: 10,

        gap: 4,
    },

    mapCountText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#374151",
    },

    markerOuter: {
        width: 40,
        height: 40,

        borderRadius: 20,

        borderWidth: 3,

        backgroundColor: "#ffffff",

        justifyContent: "center",
        alignItems: "center",
    },

    markerInner: {
        width: 30,
        height: 30,

        borderRadius: 15,

        justifyContent: "center",
        alignItems: "center",
    },

    selectedCard: {
        marginTop: 12,

        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 16,

        padding: 15,
    },

    selectedTopRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    selectedIcon: {
        width: 40,
        height: 40,

        borderRadius: 11,

        backgroundColor: "#fef2f2",

        justifyContent: "center",
        alignItems: "center",

        marginRight: 10,
    },

    selectedTitleArea: {
        flex: 1,
    },

    selectedTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#111827",
        textTransform: "capitalize",
    },

    selectedReference: {
        marginTop: 2,
        fontSize: 10,
        color: "#9ca3af",
    },

    closeButton: {
        width: 34,
        height: 34,

        justifyContent: "center",
        alignItems: "center",
    },

    selectedDetails: {
        flexDirection: "row",
        marginTop: 14,
        gap: 6,
    },

    detailItem: {
        flex: 1,

        backgroundColor: "#f8fafc",

        paddingHorizontal: 9,
        paddingVertical: 9,

        borderRadius: 10,
    },

    detailLabel: {
        fontSize: 9,
        color: "#9ca3af",
        marginBottom: 3,
    },

    detailValue: {
        fontSize: 11,
        fontWeight: "700",
        color: "#374151",
    },

    actions: {
        flexDirection: "row",
        gap: 9,
        marginTop: 12,
    },

    detailsButton: {
        flex: 1,
        height: 42,

        borderRadius: 10,

        backgroundColor: "#eff6ff",

        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        gap: 6,
    },

    detailsText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#2563eb",
    },

    trackButton: {
        flex: 1,
        height: 42,

        borderRadius: 10,

        backgroundColor: "#f5f3ff",

        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",

        gap: 6,
    },

    trackText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#7c3aed",
    },
    ambulanceMarker: {
        width: 38,
        height: 38,
        borderRadius: 19,

        backgroundColor: "#2563eb",

        borderWidth: 3,
        borderColor: "#ffffff",

        justifyContent: "center",
        alignItems: "center",

        elevation: 5,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
});