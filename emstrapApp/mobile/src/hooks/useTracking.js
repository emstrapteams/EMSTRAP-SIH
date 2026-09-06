import { useCallback, useEffect, useState } from "react";
import { getEmergencyDetails } from "../services/api";
import socket from "../services/socket";

export default function useTracking(requestId) {
    const [emergency, setEmergency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchEmergency = useCallback(async () => {
        if (!requestId) return;

        try {
            setError(null);

            const res = await getEmergencyDetails(requestId);

            if (res.success) {
                setEmergency(res.data);
            } else {
                setError("Unable to load emergency.");
            }
        } catch (err) {
            console.log("Tracking Error:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load emergency details."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [requestId]);

    // Initial fetch
    useEffect(() => {
        fetchEmergency();
    }, [fetchEmergency]);

    // Socket.IO realtime updates
    useEffect(() => {
        if (!requestId) return;

        socket.connect();

        socket.on("connect", () => {
            console.log("✅ Connected:", socket.id);

            socket.emit("track_request", {
                requestId,
            });

            console.log("📡 Joined room:", requestId);
        });

        const updateEmergency = (data) => {
            setEmergency((prev) => ({
                ...prev,
                ...data,
            }));
        };

        const ambulanceLocation = (location) => {
            setEmergency((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    ambulance: {
                        ...prev.ambulance,
                        liveLocation: location,
                    },
                };
            });
        };

        const userLocation = (location) => {
            setEmergency((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    userLiveLocation: location,
                };
            });
        };



        socket.on("ambulance_assigned", () => {
            console.log("📥 ambulance_assigned received");
            fetchEmergency();
        });

        socket.on("emergency_updated", () => {
            console.log("📥 emergency_updated received");
            fetchEmergency();
        });

        socket.on("hospital_assigned", () => {
            console.log("📥 hospital_assigned received");
            fetchEmergency();
        });

        socket.on("driver_arrived", () => {
            console.log("📥 driver_arrived received");
            fetchEmergency();
        });

        socket.on("ambulance_location", ambulanceLocation);
        socket.on("user_location", userLocation);

        return () => {
            socket.off("emergency_updated");
            socket.off("ambulance_assigned");
            socket.off("hospital_assigned");
            socket.off("driver_arrived");

            socket.off("ambulance_location", ambulanceLocation);
            socket.off("user_location", userLocation);

            socket.disconnect();
        };
    }, [requestId, fetchEmergency]);

    const refresh = async () => {
        setRefreshing(true);
        await fetchEmergency();
    };

    return {
        emergency,
        loading,
        refreshing,
        error,
        refresh,
        fetchEmergency,
    };
}