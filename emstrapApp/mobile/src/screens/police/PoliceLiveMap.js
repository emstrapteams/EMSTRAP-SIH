import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import MapView, {
    Heatmap,
    Marker,
    PROVIDER_GOOGLE,
} from "react-native-maps";

import { Ionicons } from "@expo/vector-icons";
import PoliceLayout from "../../components/police/PoliceLayout";
import {
    getPoliceEmergencies,
    getPoliceCases,
    getErrorMessage,
} from "../../services/api";

const VIEWS = {
    HEATMAP: "heatmap",
    LIVE: "live",
};

const DEFAULT_REGION = {
    latitude: 20.5937,
    longitude: 78.9629,
    latitudeDelta: 15,
    longitudeDelta: 15,
};

export default function PoliceLiveMap() {
    const mapRef = useRef(null);

    const [activeAlerts, setActiveAlerts] =
        useState([]);

    const [allCases, setAllCases] =
        useState([]);

    const [view, setView] =
        useState(VIEWS.HEATMAP);

    const [loading, setLoading] =
        useState(true);

    // -----------------------------------------
    // LOAD SAME DATA AS WEB APP
    // -----------------------------------------

    useEffect(() => {
        loadMapData();
    }, []);

    async function loadMapData() {
        try {
            setLoading(true);

            const [
                activeRes,
                casesRes,
            ] = await Promise.all([
                getPoliceEmergencies(),
                getPoliceCases(),
            ]);

            console.log(
                "POLICE LIVE EMERGENCIES:",
                activeRes
            );

            console.log(
                "POLICE LIVE CASES:",
                casesRes
            );

            if (activeRes?.success) {
                const emergencies =
                    activeRes.emergencies || [];

                const filtered =
                    emergencies.filter(
                        (item) =>
                            item.status ===
                            "PENDING" ||
                            item.status ===
                            "AMBULANCE_ACCEPTED"
                    );

                setActiveAlerts(filtered);
            }

            if (casesRes?.success) {
                setAllCases(
                    casesRes.cases || []
                );
            }
        } catch (error) {
            console.log(
                "POLICE LIVE MAP ERROR:",
                getErrorMessage(error)
            );
        } finally {
            setLoading(false);
        }
    }

    // -----------------------------------------
    // SAME HEATMAP LOGIC AS WEB
    // -----------------------------------------

    const heatPoints = useMemo(() => {
        return allCases
            .filter((item) => {
                const latitude = Number(
                    item?.location?.latitude
                );

                const longitude = Number(
                    item?.location?.longitude
                );

                return (
                    Number.isFinite(latitude) &&
                    Number.isFinite(longitude)
                );
            })
            .map((item) => {
                let weight = 0.5;

                if (
                    item.status ===
                    "COMPLETED"
                ) {
                    weight = 1.0;
                } else if (
                    item.status ===
                    "AMBULANCE_ACCEPTED"
                ) {
                    weight = 0.7;
                }

                return {
                    latitude: Number(
                        item.location.latitude
                    ),

                    longitude: Number(
                        item.location.longitude
                    ),

                    weight,
                };
            });
    }, [allCases]);

    // -----------------------------------------
    // VALID LIVE ALERTS
    // -----------------------------------------

    const liveMarkers = useMemo(() => {
        return activeAlerts
            .map((item) => {
                const latitude = Number(
                    item?.location?.latitude
                );

                const longitude = Number(
                    item?.location?.longitude
                );

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    return null;
                }

                return {
                    item,

                    coordinate: {
                        latitude,
                        longitude,
                    },
                };
            })
            .filter(Boolean);
    }, [activeAlerts]);

    // -----------------------------------------
    // SAME CENTER PRIORITY AS WEB
    // active alert -> case -> India
    // -----------------------------------------

    const initialRegion = useMemo(() => {
        const source =
            activeAlerts.length > 0
                ? activeAlerts
                : allCases;

        if (source.length > 0) {
            const latitude = Number(
                source[0]?.location?.latitude
            );

            const longitude = Number(
                source[0]?.location?.longitude
            );

            if (
                Number.isFinite(latitude) &&
                Number.isFinite(longitude)
            ) {
                return {
                    latitude,
                    longitude,
                    latitudeDelta: 0.25,
                    longitudeDelta: 0.25,
                };
            }
        }

        return DEFAULT_REGION;
    }, [activeAlerts, allCases]);

    // -----------------------------------------
    // LOADING
    // -----------------------------------------

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator
                    size="large"
                    color="#dc2626"
                />

                <Text style={styles.loadingText}>
                    Loading map data...
                </Text>
            </View>
        );
    }

    return (
        <PoliceLayout
            title="Live Map"
            description="Monitor emergency incidents and accident hotspots."
        >
            <View style={styles.container}>

                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={initialRegion}
                >

                    {/* ========================= */}
                    {/* HEATMAP */}
                    {/* ========================= */}

                    {view === VIEWS.HEATMAP &&
                        heatPoints.length > 0 && (
                            <Heatmap
                                points={heatPoints}
                                radius={35}
                                opacity={0.8}
                                gradient={{
                                    colors: [
                                        "#00008B",
                                        "#1E90FF",
                                        "#FFFF00",
                                        "#FF8C00",
                                        "#FF0000",
                                    ],

                                    startPoints: [
                                        0.0,
                                        0.3,
                                        0.5,
                                        0.7,
                                        1.0,
                                    ],

                                    colorMapSize: 256,
                                }}
                            />
                        )}

                    {/* ========================= */}
                    {/* LIVE INCIDENTS */}
                    {/* ========================= */}

                    {view === VIEWS.LIVE &&
                        liveMarkers.map(
                            ({
                                item,
                                coordinate,
                            }) => (
                                <Marker
                                    key={item._id}
                                    coordinate={
                                        coordinate
                                    }
                                    title={
                                        item?.user
                                            ?.name ||
                                        "Active Emergency"
                                    }
                                    description={
                                        `Status: ${item.status
                                        }`
                                    }
                                >
                                    <View
                                        style={
                                            styles
                                                .emergencyMarker
                                        }
                                    >
                                        <Text
                                            style={
                                                styles
                                                    .markerEmoji
                                            }
                                        >
                                            🚨
                                        </Text>
                                    </View>
                                </Marker>
                            )
                        )}

                </MapView>

                {/* ============================= */}
                {/* TOP INFO CARD */}
                {/* ============================= */}

                <View style={styles.infoCard}>

                    <Text style={styles.radarIcon}>
                        📡
                    </Text>

                    <View style={{ flex: 1 }}>
                        <Text style={styles.infoTitle}>
                            {view === VIEWS.HEATMAP
                                ? "ACCIDENT HEATMAP"
                                : "LIVE INCIDENTS"}
                        </Text>

                        <Text style={styles.infoSubtitle}>
                            {view === VIEWS.HEATMAP
                                ? `${heatPoints.length} total cases plotted`
                                : `${liveMarkers.length} active alerts`}
                        </Text>
                    </View>

                </View>

                {/* ============================= */}
                {/* VIEW TOGGLE */}
                {/* ============================= */}

                <View style={styles.toggleContainer}>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.toggleButton,

                            view === VIEWS.HEATMAP &&
                            styles.toggleSelected,
                        ]}
                        onPress={() =>
                            setView(VIEWS.HEATMAP)
                        }
                    >
                        <Text
                            style={[
                                styles.toggleText,

                                view ===
                                VIEWS.HEATMAP &&
                                styles
                                    .toggleTextSelected,
                            ]}
                        >
                            🔥 Heatmap
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                            styles.toggleButton,

                            view === VIEWS.LIVE &&
                            styles.toggleSelected,
                        ]}
                        onPress={() =>
                            setView(VIEWS.LIVE)
                        }
                    >
                        <Text
                            style={[
                                styles.toggleText,

                                view === VIEWS.LIVE &&
                                styles
                                    .toggleTextSelected,
                            ]}
                        >
                            🚨 Live
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* ============================= */}
                {/* HEATMAP LEGEND */}
                {/* ============================= */}

                {view === VIEWS.HEATMAP && (
                    <View style={styles.legend}>

                        <Text style={styles.legendTitle}>
                            INCIDENT DENSITY
                        </Text>

                        <View style={styles.legendGradient}>
                            <View
                                style={[
                                    styles.legendSection,
                                    {
                                        backgroundColor:
                                            "#00008B",
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.legendSection,
                                    {
                                        backgroundColor:
                                            "#1E90FF",
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.legendSection,
                                    {
                                        backgroundColor:
                                            "#FFFF00",
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.legendSection,
                                    {
                                        backgroundColor:
                                            "#FF8C00",
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.legendSection,
                                    {
                                        backgroundColor:
                                            "#FF0000",
                                    },
                                ]}
                            />
                        </View>

                        <View style={styles.legendLabels}>
                            <Text style={styles.legendLabel}>
                                Low
                            </Text>

                            <Text style={styles.legendLabel}>
                                High
                            </Text>
                        </View>

                    </View>
                )}

            </View>
        </PoliceLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 650,
        backgroundColor: "#f5f5f5",
        borderRadius: 16,
        overflow: "hidden",
    },

    map: {
        ...StyleSheet.absoluteFillObject,
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
    },

    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontWeight: "600",
        color: "#4b5563",
    },

    // ---------------------------------
    // INFO CARD
    // ---------------------------------

    infoCard: {
        position: "absolute",
        top: 18,
        left: 14,

        width: 205,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor: "rgba(255,255,255,0.95)",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 14,

        paddingHorizontal: 12,
        paddingVertical: 11,

        elevation: 6,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },

    radarIcon: {
        fontSize: 23,
        marginRight: 9,
    },

    infoTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: "#111827",
        letterSpacing: 1,
    },

    infoSubtitle: {
        marginTop: 3,
        fontSize: 11,
        color: "#6b7280",
    },

    // ---------------------------------
    // TOGGLE
    // ---------------------------------

    toggleContainer: {
        position: "absolute",
        top: 92,
        right: 14,

        flexDirection: "row",

        backgroundColor:
            "rgba(255,255,255,0.95)",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 13,

        padding: 4,

        elevation: 6,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },

    toggleButton: {
        paddingHorizontal: 13,
        paddingVertical: 10,
        borderRadius: 10,
    },

    toggleSelected: {
        backgroundColor: "#dc2626",
    },

    toggleText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#4b5563",
    },

    toggleTextSelected: {
        color: "#ffffff",
    },

    // ---------------------------------
    // EMERGENCY MARKER
    // ---------------------------------

    emergencyMarker: {
        width: 44,
        height: 44,

        borderRadius: 22,

        backgroundColor: "#ffffff",

        borderWidth: 2,
        borderColor: "#ff3b30",

        justifyContent: "center",
        alignItems: "center",

        elevation: 5,

        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },

    markerEmoji: {
        fontSize: 21,
    },

    // ---------------------------------
    // LEGEND
    // ---------------------------------

    legend: {
        position: "absolute",

        bottom: 30,
        left: 16,

        width: 170,

        backgroundColor:
            "rgba(255,255,255,0.95)",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 14,

        padding: 14,

        elevation: 6,

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },

    legendTitle: {
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1.3,
        color: "#6b7280",
        marginBottom: 10,
    },

    legendGradient: {
        height: 13,
        borderRadius: 10,
        overflow: "hidden",
        flexDirection: "row",
    },

    legendSection: {
        flex: 1,
    },

    legendLabels: {
        marginTop: 6,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    legendLabel: {
        fontSize: 10,
        color: "#6b7280",
    },
});