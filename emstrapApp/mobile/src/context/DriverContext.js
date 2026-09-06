import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import socket from "../services/socket";
import { updateDriverLocation } from "../services/driverService";
const DriverContext = createContext();

export function DriverProvider({ children }) {

    const [driver, setDriver] = useState(null);

    const [online, setOnline] = useState(false);

    const [currentEmergency, setCurrentEmergency] =
        useState(null);

    const [incomingEmergencies, setIncomingEmergencies] =
        useState([]);
    const [driverLocation, setDriverLocation] =
        useState(null);

    const [currentHospital, setCurrentHospital] =
        useState(null);

    const [routeCoordinates, setRouteCoordinates] =
        useState([]);

    const [distance, setDistance] =
        useState(0);

    const [eta, setEta] =
        useState(0);

    const [tripStatus, setTripStatus] =
        useState("WAITING");

    const [socketConnected, setSocketConnected] =
        useState(false);
    const [loading, setLoading] = useState(true);
    const locationSubscription = useRef(null);
    const [incomingVisible, setIncomingVisible] =
        useState(false);
    useEffect(() => {

        loadDriver();

    }, []);

    const loadDriver = async () => {

        try {

            const data =
                await AsyncStorage.getItem("user");

            if (data) {

                const parsed = JSON.parse(data);

                setDriver(parsed);

                setOnline(
                    parsed.driverStatus === "LIVE"
                );

            }

            // Restore current trip
            const savedEmergency =
                await AsyncStorage.getItem(
                    "currentEmergency"
                );

            if (savedEmergency) {

                const emergency = JSON.parse(savedEmergency);

                setCurrentEmergency(emergency);

                setTripStatus("ON_TRIP");

            }

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    };
    const startLocationTracking = async () => {

        try {

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                console.log("❌ Location permission denied");
                return;
            }

            if (locationSubscription.current) {
                return;
            }

            locationSubscription.current =
                await Location.watchPositionAsync(

                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 5,
                        timeInterval: 3000,
                    },

                    async (location) => {

                        const current = {

                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,

                        };

                        setDriverLocation(current);

                        if (socket.connected) {

                            socket.emit("update_location", {

                                latitude: current.latitude,
                                longitude: current.longitude,

                            });

                        }

                        try {

                            await updateDriverLocation(

                                current.latitude,
                                current.longitude

                            );

                        } catch (err) {

                            console.log(
                                "Location update failed",
                                err
                            );

                        }

                    }

                );

        } catch (err) {

            console.log(err);

        }

    };
    const stopLocationTracking = () => {

        if (locationSubscription.current) {

            locationSubscription.current.remove();

            locationSubscription.current = null;

        }

    };
    return (

        <DriverContext.Provider
            value={{
                driver,
                setDriver,

                online,
                setOnline,

                currentEmergency,
                setCurrentEmergency,

                driverLocation,
                setDriverLocation,

                currentHospital,
                setCurrentHospital,

                routeCoordinates,
                setRouteCoordinates,

                distance,
                setDistance,

                eta,
                setEta,

                tripStatus,
                setTripStatus,

                socketConnected,
                setSocketConnected,

                loading,
                startLocationTracking,
                stopLocationTracking,
                incomingVisible,
                setIncomingVisible,

                incomingEmergencies,
                setIncomingEmergencies,
            }}
        >
            {children}
        </DriverContext.Provider>

    );

}

export function useDriver() {

    return useContext(DriverContext);

}