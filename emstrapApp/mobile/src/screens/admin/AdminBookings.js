import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";

import AdminLayout from "../../components/admin/AdminLayout";
import BookingCard from "../../components/admin/BookingCard";

import API from "../../config/api";

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }

            const res = await API.get("/api/admin/bookings");

            const data = res.data;

            // Supports different backend response structures
            const bookingList =
                data?.bookings ||
                data?.data ||
                (Array.isArray(data) ? data : []);

            setBookings(bookingList);
        } catch (err) {
            console.log(
                "BOOKING FETCH ERROR:",
                err?.response?.data || err.message
            );

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Failed to load bookings."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings(true);
    };

    // ------------------------------------------------
    // VIEW BOOKING
    // ------------------------------------------------

    const handleView = (booking) => {
        const userName =
            booking.user?.name ||
            booking.userName ||
            "Unknown User";

        const userEmail =
            booking.user?.email ||
            booking.userEmail ||
            "N/A";

        const driverName =
            booking.driver?.name ||
            booking.driverName ||
            "Not Assigned";

        const pickup =
            booking.pickupLocation?.address ||
            booking.pickup?.address ||
            booking.pickupAddress ||
            "N/A";

        const dropoff =
            booking.dropoffLocation?.address ||
            booking.destination?.address ||
            booking.dropoffAddress ||
            "N/A";

        const status =
            booking.status || "UNKNOWN";

        const price =
            booking.estimatedPrice ??
            booking.price ??
            booking.fare ??
            0;

        Alert.alert(
            "Booking Details",
            `User: ${userName}

Email: ${userEmail}

Driver: ${driverName}

Pickup: ${pickup}

Destination: ${dropoff}

Status: ${status}

Fare: ₹${price}`
        );
    };

    // ------------------------------------------------
    // UPDATE STATUS
    // ------------------------------------------------

    const handleEdit = (booking) => {
        Alert.alert(
            "Update Booking Status",
            `Current status: ${booking.status || "UNKNOWN"}`,
            [
                {
                    text: "Pending",
                    onPress: () =>
                        changeStatus(
                            booking._id,
                            "PENDING"
                        ),
                },
                {
                    text: "Accepted",
                    onPress: () =>
                        changeStatus(
                            booking._id,
                            "ACCEPTED"
                        ),
                },
                {
                    text: "Completed",
                    onPress: () =>
                        changeStatus(
                            booking._id,
                            "COMPLETED"
                        ),
                },
                {
                    text: "Cancel",
                    style: "cancel",
                },
            ]
        );
    };

    const changeStatus = async (bookingId, status) => {
        try {
            const res = await API.put(
                `/api/admin/bookings/${bookingId}/status`,
                {
                    status,
                }
            );

            const updatedBooking =
                res.data?.booking;

            setBookings((prev) =>
                prev.map((booking) => {
                    if (booking._id !== bookingId) {
                        return booking;
                    }

                    if (updatedBooking) {
                        return updatedBooking;
                    }

                    return {
                        ...booking,
                        status,
                    };
                })
            );

            Alert.alert(
                "Success",
                `Booking status updated to ${status}.`
            );
        } catch (err) {
            console.log(
                "STATUS UPDATE ERROR:",
                err?.response?.data || err.message
            );

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Unable to update booking status."
            );
        }
    };

    // ------------------------------------------------
    // DELETE BOOKING
    // ------------------------------------------------

    const handleDelete = (booking) => {
        Alert.alert(
            "Delete Booking",
            "Are you sure you want to delete this booking?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () =>
                        confirmDelete(booking._id),
                },
            ]
        );
    };

    const confirmDelete = async (bookingId) => {
        try {
            await API.delete(
                `/api/admin/bookings/${bookingId}`
            );

            setBookings((prev) =>
                prev.filter(
                    (booking) =>
                        booking._id !== bookingId
                )
            );

            Alert.alert(
                "Deleted",
                "Booking deleted successfully."
            );
        } catch (err) {
            console.log(
                "DELETE BOOKING ERROR:",
                err?.response?.data || err.message
            );

            Alert.alert(
                "Error",
                err?.response?.data?.message ||
                "Unable to delete booking."
            );
        }
    };

    // ------------------------------------------------
    // UI
    // ------------------------------------------------

    return (
        <AdminLayout
            title="Booking Management"
            description="Manage ambulance bookings"
        >
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="large"
                        color="#2563eb"
                    />

                    <Text style={styles.loadingText}>
                        Loading bookings...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item, index) =>
                        item?._id?.toString() ||
                        `booking-${index}`
                    }
                    renderItem={({ item }) => (
                        <BookingCard
                            booking={item}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>
                                No bookings found
                            </Text>

                            <Text style={styles.emptyText}>
                                New ambulance bookings will
                                appear here.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={
                        bookings.length === 0
                            ? styles.emptyList
                            : styles.list
                    }
                />
            )}
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    loader: {
        paddingVertical: 70,
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 12,
        color: "#6b7280",
        fontSize: 14,
    },

    list: {
        paddingBottom: 100,
    },

    emptyList: {
        flexGrow: 1,
    },

    emptyContainer: {
        paddingVertical: 80,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },

    emptyText: {
        color: "#6b7280",
        marginTop: 7,
        textAlign: "center",
    },
});