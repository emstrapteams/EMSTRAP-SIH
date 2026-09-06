import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { updateDriverLocation } from "../../services/api";

export default function useDriverLocation(
    enabled = true
) {
    const subscriptionRef = useRef(null);

    useEffect(() => {
        if (!enabled) return;

        let mounted = true;

        const startTracking = async () => {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (
                status !== "granted" ||
                !mounted
            ) {
                console.log(
                    "Location permission denied"
                );
                return;
            }

            subscriptionRef.current =
                await Location.watchPositionAsync(
                    {
                        accuracy:
                            Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 10,
                    },
                    async (location) => {
                        try {
                            await updateDriverLocation(
                                location.coords.latitude,
                                location.coords.longitude
                            );

                            console.log(
                                "Driver location updated"
                            );
                        } catch (error) {
                            console.log(
                                "Location update failed",
                                error?.response?.data ||
                                error.message
                            );
                        }
                    }
                );
        };

        startTracking();

        return () => {
            mounted = false;

            if (subscriptionRef.current) {
                subscriptionRef.current.remove();
            }
        };
    }, [enabled]);
}