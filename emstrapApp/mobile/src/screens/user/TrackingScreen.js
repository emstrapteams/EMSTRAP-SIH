import { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl,
} from "react-native";

import MapView, {
    Marker,
    Polyline,
    PROVIDER_GOOGLE,
} from "react-native-maps";
import EvidenceCard from "../../components/tracking/EvidenceCard";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";


import { io } from "socket.io-client";

import API, { API_URL } from "../../services/api";

const SOCKET_URL = API_URL;
export default function TrackingScreen() {

    const { id, type } = useLocalSearchParams();

    const mapRef = useRef(null);
    const socketRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [tracking, setTracking] = useState(null);

    const [status, setStatus] = useState("");

    const [userLocation, setUserLocation] = useState(null);

    const [ambulanceLocation, setAmbulanceLocation] =
        useState(null);

    const [hospitalLocation, setHospitalLocation] =
        useState(null);

    const [distance, setDistance] = useState(0);

    const [eta, setEta] = useState("--");

    useEffect(() => {
        initialize();
    }, []);

    async function initialize() {
        await getCurrentLocation();
        await loadTracking();
        connectSocket();
    }

    async function getCurrentLocation() {

        const { status } =
            await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {

            Alert.alert(
                "Permission Required",
                "Location permission is required."
            );

            return;
        }

        const location =
            await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

        const coords = {

            latitude: location.coords.latitude,

            longitude: location.coords.longitude,

            latitudeDelta: 0.01,

            longitudeDelta: 0.01,

        };

        setUserLocation(coords);

    }

    async function loadTracking() {

        try {

            setLoading(true);

            const endpoint =
                type === "booking"
                    ? `/api/bookings/${id}`
                    : `/api/emergency/${id}`;

            const res = await API.get(endpoint);

            const data = res.data.data || res.data;

            setTracking(data);

            setStatus(data.status);

            //---------------------------------------
            // Ambulance
            //---------------------------------------

            if (
                data?.ambulance?.currentLocation?.latitude &&
                data?.ambulance?.currentLocation?.longitude
            ) {

                const amb = {

                    latitude:
                        data.ambulance.currentLocation.latitude,

                    longitude:
                        data.ambulance.currentLocation.longitude,

                };

                setAmbulanceLocation(amb);

            }

            //---------------------------------------
            // Hospital
            //---------------------------------------

            if (
                data?.hospital?.location?.latitude &&
                data?.hospital?.location?.longitude
            ) {

                setHospitalLocation({

                    latitude:
                        data.hospital.location.latitude,

                    longitude:
                        data.hospital.location.longitude,

                });

            }

            //---------------------------------------
            // User / Patient
            //---------------------------------------

            if (
                data?.location?.latitude &&
                data?.location?.longitude
            ) {

                const patient = {

                    latitude: data.location.latitude,

                    longitude: data.location.longitude,

                };

                setUserLocation(patient);

            }

            calculateETA(data);

        } catch (err) {

            console.log(err);

            Alert.alert(
                "Error",
                "Unable to load tracking."
            );

        } finally {

            setLoading(false);

        }

    }

    function connectSocket() {

        socketRef.current = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        socketRef.current.emit("track_request", {
            requestId: id,
        });

        socketRef.current.on(
            "ambulance_location",
            (data) => {

                const location = {

                    latitude:
                        data.lat || data.latitude,

                    longitude:
                        data.lng || data.longitude,

                };

                setAmbulanceLocation(location);

            }
        );

        socketRef.current.on(
            "user_location",
            (data) => {

                const location = {

                    latitude:
                        data.lat || data.latitude,

                    longitude:
                        data.lng || data.longitude,

                };

                setUserLocation(location);

            }
        );

        socketRef.current.on(
            "emergency_updated",
            (request) => {

                setTracking(request);

                setStatus(request.status);

            }
        );

    }

    useEffect(() => {

        return () => {

            socketRef.current?.disconnect();

        };

    }, []);

    async function onRefresh() {

        setRefreshing(true);

        await loadTracking();

        setRefreshing(false);

    }

    function calculateETA(request) {

        if (
            !request?.ambulance?.currentLocation ||
            !request?.location
        )
            return;

        const driver =
            request.ambulance.currentLocation;

        const patient =
            request.location;

        const km = getDistanceKm(
            driver.latitude,
            driver.longitude,
            patient.latitude,
            patient.longitude
        );

        setDistance(km);

        const mins =
            Math.max(1, Math.round(km / 0.6));

        setEta(`${mins} mins`);

    }

    function getDistanceKm(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const R = 6371;

        const dLat =
            ((lat2 - lat1) * Math.PI) / 180;

        const dLon =
            ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return (R * c).toFixed(2);

    }

    if (loading) {

        return (

            <SafeAreaView style={styles.loader}>

                <ActivityIndicator
                    size="large"
                    color="#e53935"
                />

            </SafeAreaView>

        );

    }
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                        latitude:
                            userLocation?.latitude ||
                            ambulanceLocation?.latitude ||
                            12.9716,
                        longitude:
                            userLocation?.longitude ||
                            ambulanceLocation?.longitude ||
                            77.5946,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation
                    showsMyLocationButton
                >
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="Your Location"
                            pinColor="blue"
                        />
                    )}

                    {ambulanceLocation && (
                        <Marker
                            coordinate={ambulanceLocation}
                            title="Ambulance"
                            pinColor="red"
                        />
                    )}

                    {hospitalLocation && (
                        <Marker
                            coordinate={hospitalLocation}
                            title="Hospital"
                            pinColor="green"
                        />
                    )}

                    {userLocation && ambulanceLocation && (
                        <Polyline
                            coordinates={[
                                ambulanceLocation,
                                userLocation,
                            ]}
                            strokeWidth={5}
                            strokeColor="#E53935"
                        />
                    )}

                    {hospitalLocation &&
                        ambulanceLocation && (
                            <Polyline
                                coordinates={[
                                    ambulanceLocation,
                                    hospitalLocation,
                                ]}
                                strokeWidth={4}
                                strokeColor="#2E7D32"
                            />
                        )}
                </MapView>

                <View style={styles.card}>
                    <Text style={styles.heading}>
                        Live Tracking
                    </Text>

                    <Text style={styles.status}>
                        Status: {status}
                    </Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoBox}>
                            <Text style={styles.label}>
                                ETA
                            </Text>

                            <Text style={styles.value}>
                                {eta}
                            </Text>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.label}>
                                Distance
                            </Text>

                            <Text style={styles.value}>
                                {distance} km
                            </Text>
                        </View>
                    </View>
                </View>
                <EvidenceCard
                    emergencyId={tracking?._id}
                    evidence={tracking?.evidence || []}
                    onUploaded={loadTracking}
                />

                {tracking?.ambulance && (
                    <View style={styles.card}>
                        <Text style={styles.heading}>
                            Driver Details
                        </Text>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Name
                            </Text>

                            <Text style={styles.text}>
                                {tracking.ambulance.name}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Mobile
                            </Text>

                            <Text style={styles.text}>
                                {tracking.ambulance.mobile ||
                                    "N/A"}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Vehicle
                            </Text>

                            <Text style={styles.text}>
                                {tracking.ambulance
                                    .vehicleNumber || "N/A"}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Driver Status
                            </Text>

                            <Text style={styles.text}>
                                {tracking.ambulance
                                    .driverStatus || "LIVE"}
                            </Text>
                        </View>
                    </View>
                )}

                {tracking?.hospital && (
                    <View style={styles.card}>
                        <Text style={styles.heading}>
                            Assigned Hospital
                        </Text>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Hospital
                            </Text>

                            <Text style={styles.text}>
                                {tracking.hospital.name}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Mobile
                            </Text>

                            <Text style={styles.text}>
                                {tracking.hospital.mobile}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                Address
                            </Text>

                            <Text style={styles.text}>
                                {tracking.hospital.address}
                            </Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.title}>
                                City
                            </Text>

                            <Text style={styles.text}>
                                {tracking.hospital.city}
                            </Text>
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={loadTracking}
                >
                    <Text
                        style={styles.refreshText}
                    >
                        Refresh Tracking
                    </Text>
                </TouchableOpacity>

                <View
                    style={{ height: 30 }}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    map: {
        width: "100%",
        height: 350,
    },

    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    heading: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 14,
    },

    status: {
        fontSize: 16,
        fontWeight: "600",
        color: "#E53935",
        marginBottom: 18,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    infoBox: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 14,
        marginHorizontal: 4,
        alignItems: "center",
    },

    label: {
        fontSize: 13,
        color: "#64748B",
        marginBottom: 6,
    },

    value: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 8,
        alignItems: "center",
    },

    title: {
        fontSize: 15,
        color: "#475569",
        fontWeight: "600",
        flex: 1,
    },

    text: {
        flex: 1,
        textAlign: "right",
        color: "#0F172A",
        fontWeight: "500",
        fontSize: 15,
    },

    refreshButton: {
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: "#E53935",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 24,
    },

    refreshText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});