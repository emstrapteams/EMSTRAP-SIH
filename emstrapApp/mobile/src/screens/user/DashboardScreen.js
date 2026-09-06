import { useEffect, useMemo, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import UserHeader from "../../components/common/UserHeader";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
export default function DashboardScreen() {

    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {

        try {

            const [bookingRes, emergencyRes] =
                await Promise.all([
                    API.get("/api/bookings"),
                    API.get("/api/emergency"),
                ]);

            setBookings(bookingRes.data?.data || []);
            setEmergencies(emergencyRes.data?.data || []);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const combined = useMemo(() => {

        const bookingData = bookings.map((b) => ({
            ...b,
            type: "booking",
        }));

        const emergencyData = emergencies.map((e) => ({
            ...e,
            type: "emergency",
        }));

        return [...bookingData, ...emergencyData].sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );

    }, [bookings, emergencies]);

    const stats = {

        total: combined.length,

        active: combined.filter((i) =>
            ["PENDING",
                "ACCEPTED",
                "IN_PROGRESS",
                "AMBULANCE_ACCEPTED",
                "ARRIVED_AT_LOCATION",
                "EN_ROUTE_TO_HOSPITAL"]
                .includes(i.status)
        ).length,

        completed: combined.filter(
            (i) => i.status === "COMPLETED"
        ).length,

        cancelled: combined.filter(
            (i) => i.status === "CANCELLED"
        ).length,

    };

    if (loading) {

        return (
            <SafeAreaView style={styles.loader}>
                <ActivityIndicator
                    size="large"
                    color="#dc2626"
                />
            </SafeAreaView>
        );

    }

    return (
        <SafeAreaView style={styles.container}>

            <UserHeader />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            loadDashboard();
                        }}
                    />
                }
            >


                <View style={styles.statsContainer}>

                    <StatCard
                        title="Total"
                        value={stats.total}
                    />

                    <StatCard
                        title="Active"
                        value={stats.active}
                    />

                    <StatCard
                        title="Completed"
                        value={stats.completed}
                    />

                    <StatCard
                        title="Cancelled"
                        value={stats.cancelled}
                    />

                </View>

                <Text style={styles.sectionTitle}>
                    Recent Activity
                </Text>

                {combined.length === 0 ? (

                    <View style={styles.emptyCard}>
                        <Text>No activity found.</Text>
                    </View>

                ) : (

                    combined.slice(0, 5).map(item => (

                        <ActivityCard
                            key={item._id}
                            item={item}
                        />

                    ))

                )}

            </ScrollView>

        </SafeAreaView>

    );

}

function StatCard({ title, value }) {

    return (

        <View style={styles.statCard}>

            <Text style={styles.statValue}>
                {value}
            </Text>

            <Text style={styles.statTitle}>
                {title}
            </Text>

        </View>

    );

}

function ActivityCard({ item }) {
    const router = useRouter();

    const emergency = item.type === "emergency";

    const badgeColor = () => {
        switch (item.status) {
            case "COMPLETED":
                return "#16a34a";

            case "CANCELLED":
                return "#dc2626";

            case "PENDING":
                return "#f59e0b";

            default:
                return "#2563eb";
        }
    };

    return (
        <TouchableOpacity
            style={styles.activityCard}
            onPress={() =>
                router.push({
                    pathname: "/user/tracking",
                    params: {
                        id: item._id,
                        type: item.type,
                    },
                })
            }
        >
            <View style={styles.activityTop}>

                <View style={styles.iconContainer}>

                    <MaterialCommunityIcons
                        name={
                            emergency
                                ? "alert-circle"
                                : "ambulance"
                        }
                        size={26}
                        color="#fff"
                    />

                </View>

                <View style={{ flex: 1 }}>

                    <Text style={styles.activityTitle}>
                        {emergency
                            ? "Emergency Request"
                            : "Ambulance Booking"}
                    </Text>

                    <Text style={styles.activitySubtitle}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>

                </View>

                <View
                    style={[
                        styles.badge,
                        {
                            backgroundColor:
                                badgeColor(),
                        },
                    ]}
                >
                    <Text style={styles.badgeText}>
                        {item.status}
                    </Text>
                </View>

            </View>

            <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                    router.push({
                        pathname:
                            emergency
                                ? "/tracking"
                                : "/user/booking-tracking",
                        params: emergency
                            ? {
                                requestId: item._id,
                            }
                            : {
                                bookingId: item._id,
                            },
                    })
                }
            >
                <Text style={styles.viewText}>
                    View →
                </Text>
            </TouchableOpacity>

        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#f5f6fa"
    },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    header: {
        padding: 20
    },

    hello: {
        fontSize: 16,
        color: "#777"
    },

    name: {
        fontSize: 28,
        fontWeight: "700",
        marginTop: 5
    },

    statsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 15
    },

    statCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        alignItems: "center"
    },

    statValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#dc2626"
    },

    statTitle: {
        marginTop: 5,
        color: "#777"
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 15
    },

    emptyCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        padding: 25,
        borderRadius: 15,
        alignItems: "center"
    },

    activityCard: {
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 15,
        padding: 15
    },

    activityType: {
        fontWeight: "700",
        fontSize: 16
    },

    status: {
        marginTop: 8,
        color: "#666"
    },
    activityTop: {
        flexDirection: "row",
        alignItems: "center",
    },

    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#dc2626",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    activityTitle: {
        fontSize: 17,
        fontWeight: "700",
    },

    activitySubtitle: {
        color: "#777",
        marginTop: 3,
    },

    badge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
    },

    badgeText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 12,
    },

    viewButton: {
        marginTop: 14,
        alignSelf: "flex-end",
    },

    viewText: {
        color: "#2563EB",
        fontWeight: "700",
        fontSize: 15,
    },

    content: {
        paddingTop: 20,
        paddingBottom: 120,
    },
});