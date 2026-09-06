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
import {
    updateDriverLocation,
} from "../services/privateDriverService";
const PrivateDriverContext = createContext();

export function PrivateDriverProvider({ children }) {

    const [driver, setDriver] = useState(null);

    const [online, setOnline] = useState(false);

    const [currentBooking, setCurrentBooking] =
        useState(null);

    const [incomingBookings, setIncomingBookings] =
        useState([]);

    const [driverLocation, setDriverLocation] =
        useState(null);

    const [dropoffLocation, setDropoffLocation] =
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

    const [loading, setLoading] =
        useState(true);

    const [incomingVisible, setIncomingVisible] =
        useState(false);

    const locationSubscription = useRef(null);

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
            const savedBooking =
                await AsyncStorage.getItem(
                    "currentBooking"
                );

            if (savedBooking) {

                const booking =
                    JSON.parse(savedBooking);

                setCurrentBooking(booking);

                switch (booking.status) {

                    case "ACCEPTED":

                        setTripStatus("TO_PICKUP");

                        break;

                    case "ARRIVED":

                        setTripStatus("AT_PICKUP");

                        break;

                    case "IN_PROGRESS":

                        setTripStatus("TO_DESTINATION");

                        break;

                    default:

                        setTripStatus("WAITING");

                }

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

                        accuracy:
                            Location.Accuracy.High,

                        distanceInterval: 5,

                        timeInterval: 3000,

                    },

                    async (location) => {

                        const current = {

                            latitude:
                                location.coords.latitude,

                            longitude:
                                location.coords.longitude,

                        };

                        setDriverLocation(current);

                        if (socket.connected) {

                            socket.emit(
                                "update_location",
                                {

                                    latitude:
                                        current.latitude,

                                    longitude:
                                        current.longitude,

                                }
                            );

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

        <PrivateDriverContext.Provider
            value={{

                driver,
                setDriver,

                online,
                setOnline,

                currentBooking,
                setCurrentBooking,

                incomingBookings,
                setIncomingBookings,

                driverLocation,
                setDriverLocation,

                dropoffLocation,
                setDropoffLocation,

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

            }}
        >

            {children}

        </PrivateDriverContext.Provider>

    );

}

export function usePrivateDriver() {

    return useContext(PrivateDriverContext);

}