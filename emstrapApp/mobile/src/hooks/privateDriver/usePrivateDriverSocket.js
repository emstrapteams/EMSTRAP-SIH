import { useEffect } from "react";
import socket from "../../services/socket";
import { usePrivateDriver } from "../../context/PrivateDriverContext";
import { notifyBooking } from "../../services/notificationService";
export default function usePrivateDriverSocket() {

    const {

        driver,

        online,

        setIncomingBookings,

    } = usePrivateDriver();

    useEffect(() => {

        if (!driver || !online)
            return;

        socket.connect();

        console.log("🚖 Private Driver Connected");

        socket.emit("join_private_driver");

        socket.on(
            "new_booking_request",
            async booking => {

                console.log(
                    "🚖 New Booking Received"
                );

                let isNew = false;

                setIncomingBookings(prev => {

                    const exists =
                        prev.some(
                            b => b._id === booking._id
                        );

                    if (exists)
                        return prev;

                    isNew = true;

                    return [
                        booking,
                        ...prev,
                    ];

                });

                if (isNew && online) {

                    await notifyBooking();

                }

            }
        );

        socket.on(
            "booking_declined",
            ({ bookingId }) => {

                setIncomingBookings(prev =>
                    prev.filter(
                        b => b._id !== bookingId
                    )
                );

            }
        );

        socket.on(
            "booking_cancelled",
            ({ bookingId }) => {

                setIncomingBookings(prev =>
                    prev.filter(
                        b => b._id !== bookingId
                    )
                );

            }
        );
        socket.on(
            "booking_accepted",
            ({ bookingId }) => {

                setIncomingBookings(prev =>
                    prev.filter(
                        b => b._id !== bookingId
                    )
                );

            }
        );

        return () => {

            socket.off(
                "new_booking_request"
            );

            socket.off(
                "booking_declined"
            );

            socket.off(
                "booking_cancelled"
            );
            socket.off("booking_accepted");

            socket.emit(
                "leave_private_driver"
            );

            socket.disconnect();

        };

    }, [driver, online]);

}