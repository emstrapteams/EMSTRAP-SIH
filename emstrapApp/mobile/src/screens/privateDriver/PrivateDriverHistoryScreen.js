import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";

import PrivateDriverHeader from "../../components/privateDriver/PrivateDriverHeader";

import { getBookingHistory } from "../../services/privateBookingService";

export default function PrivateDriverHistoryScreen() {

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadHistory();

    }, []);

    async function loadHistory() {

        try {

            const data =
                await getBookingHistory();

            setHistory(data);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    }

    function renderItem({ item }) {

        return (

            <View style={styles.card}>

                <View style={styles.topRow}>

                    <Text style={styles.name}>
                        {item.user?.name || "Passenger"}
                    </Text>

                    <View style={styles.badge}>

                        <Text style={styles.badgeText}>
                            COMPLETED
                        </Text>

                    </View>

                </View>

                <Text style={styles.label}>
                    Pickup
                </Text>

                <Text style={styles.value}>
                    {item.pickupLocation?.address}
                </Text>

                <Text style={styles.label}>
                    Drop
                </Text>

                <Text style={styles.value}>
                    {item.dropoffLocation?.address}
                </Text>

                <View style={styles.row}>

                    <View>

                        <Text style={styles.smallLabel}>
                            Distance
                        </Text>

                        <Text style={styles.smallValue}>
                            {item.distanceKm} km
                        </Text>

                    </View>

                    <View>

                        <Text style={styles.smallLabel}>
                            Fare
                        </Text>

                        <Text style={styles.smallValue}>
                            ₹{item.estimatedPrice}
                        </Text>

                    </View>

                </View>

                <Text style={styles.date}>
                    {new Date(
                        item.updatedAt
                    ).toLocaleString()}
                </Text>

            </View>

        );

    }

    return (

        <SafeAreaView style={styles.container}>

            <PrivateDriverHeader />

            <Text style={styles.heading}>
                Ride History
            </Text>

            {loading ? (

                <ActivityIndicator
                    size="large"
                    style={{ marginTop: 40 }}
                />

            ) : (

                <FlatList
                    data={history}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={{
                        paddingBottom: 30,
                    }}
                    ListEmptyComponent={
                        <View style={styles.empty}>

                            <Text style={styles.emptyTitle}>
                                No Completed Rides
                            </Text>

                        </View>
                    }
                />

            )}

        </SafeAreaView>

    );

}

const styles = StyleSheet.create({

    container: {

        flex: 1,

        backgroundColor: "#F8FAFC",

    },

    heading: {

        fontSize: 24,

        fontWeight: "700",

        margin: 18,

    },

    card: {

        backgroundColor: "#fff",

        marginHorizontal: 16,

        marginBottom: 16,

        borderRadius: 18,

        padding: 16,

        elevation: 4,

    },

    topRow: {

        flexDirection: "row",

        justifyContent: "space-between",

        alignItems: "center",

        marginBottom: 12,

    },

    name: {

        fontSize: 18,

        fontWeight: "700",

    },

    badge: {

        backgroundColor: "#DCFCE7",

        paddingHorizontal: 10,

        paddingVertical: 5,

        borderRadius: 20,

    },

    badgeText: {

        color: "#15803D",

        fontWeight: "700",

        fontSize: 12,

    },

    label: {

        color: "#6B7280",

        marginTop: 8,

        fontWeight: "600",

    },

    value: {

        color: "#111827",

        marginTop: 2,

    },

    row: {

        flexDirection: "row",

        justifyContent: "space-between",

        marginTop: 18,

    },

    smallLabel: {

        color: "#6B7280",

    },

    smallValue: {

        fontWeight: "700",

        marginTop: 4,

    },

    date: {

        marginTop: 18,

        color: "#9CA3AF",

        fontSize: 12,

    },

    empty: {

        marginTop: 120,

        alignItems: "center",

    },

    emptyTitle: {

        fontSize: 18,

        fontWeight: "700",

        color: "#6B7280",

    },

});