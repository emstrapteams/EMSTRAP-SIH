import { useEffect } from "react";
import { useRouter } from "expo-router";
import socket from "../../services/socket";
import { useDriver } from "../../context/DriverContext";
import { notifyEmergency } from "../../services/notificationService";
export default function useDriverSocket() {
    const router = useRouter();
    const {
        driver,
        online,
        setCurrentEmergency,
        incomingEmergencies,
        setIncomingEmergencies,
    } = useDriver();
    useEffect(() => {

        if (!driver || !online) return;

        socket.connect();

        console.log("🚑 Driver Socket Connected");

        socket.emit("join_ambulance", {
            ambulanceId: driver._id,
        });
        socket.on("new_emergency_request", async (request) => {

            console.log("🚨 Emergency Received");

            let isNew = false;

            setIncomingEmergencies(prev => {

                const exists = prev.some(
                    e => e._id === request._id
                );

                if (exists) return prev;

                isNew = true;

                return [request, ...prev];

            });

            if (isNew && online) {

                await notifyEmergency();

            }

        });
        socket.on("emergency_accepted", ({ requestId }) => {

            setIncomingEmergencies(prev =>
                prev.filter(
                    e => e._id !== requestId
                )
            );

        });
        socket.on("emergency_cancelled", ({ requestId }) => {

            setIncomingEmergencies(prev =>
                prev.filter(
                    e => e._id !== requestId
                )
            );

        });

        return () => {

            socket.off("new_emergency_request");
            socket.off("emergency_accepted");
            socket.off("emergency_cancelled");

            socket.disconnect();

        };

    }, [driver, online]);
}