import { useEffect, useState } from "react";
import * as Location from "expo-location";

import socket from "../../services/socket";
import { getRoutePolyline } from "../../services/routeService";

export default function usePrivateNavigation(
    booking,
    destination
) {

    const [driverLocation, setDriverLocation] =
        useState(null);

    const [route, setRoute] =
        useState([]);

    const [distance, setDistance] =
        useState(0);

    const [duration, setDuration] =
        useState(0);

    useEffect(() => {

        let subscription;

        async function startTracking() {

            const permission =
                await Location.requestForegroundPermissionsAsync();

            if (permission.status !== "granted")
                return;

            subscription =
                await Location.watchPositionAsync(

                    {
                        accuracy: Location.Accuracy.High,
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

                        // Send live location to booking socket
                        if (socket.connected) {

                            socket.emit("update_location", {
                                requestId: currentBooking?._id,
                                latitude: current.latitude,
                                longitude: current.longitude,
                            });

                        }

                        if (
                            destination &&
                            destination.latitude != null &&
                            destination.longitude != null
                        ) {

                            const result =
                                await getRoutePolyline(
                                    current,
                                    destination
                                );

                            if (result) {

                                setRoute(
                                    result.coordinates || []
                                );

                                setDistance(
                                    result.distanceKm ?? 0
                                );

                                setDuration(
                                    result.durationMin ?? 0
                                );

                            }

                        }

                    }

                );

        }

        startTracking();

        return () => {

            subscription?.remove();

        };

    }, [booking, destination]);

    return {

        driverLocation,

        route,

        distance,

        duration,

    };

}