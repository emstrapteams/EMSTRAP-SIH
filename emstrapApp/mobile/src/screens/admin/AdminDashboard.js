import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import AdminLayout from "../../components/admin/AdminLayout";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AIEmergencyPanel from "../../components/admin/AIEmergencyPanel";

import {
    getOverviewStats,
    getAdminStats,
    getActiveEmergencies,
    getActiveBookings,
    getErrorMessage,
} from "../../services/api";
import AdminLiveMap from "../../components/admin/AdminLiveMap";
import AdminOverviewChart from "../../components/admin/AdminOverviewChart";
import AdminMetricChart from "../../components/admin/AdminMetricChart";
const defaultStats = {
    users: 0,
    bookings: 0,
    hospitals: 0,
    emergencies: 0,
    police: 0,
    liveAmbulances: 0,
};

const overviewItems = [
    {
        key: "users",
        title: "Users",
        helper: "Registered accounts",
        color: "#6366f1",
    },
    {
        key: "bookings",
        title: "Bookings",
        helper: "Ambulance bookings",
        color: "#10b981",
    },
    {
        key: "hospitals",
        title: "Hospitals",
        helper: "Hospital records",
        color: "#3b82f6",
    },
    {
        key: "emergencies",
        title: "Emergencies",
        helper: "Emergency requests",
        color: "#ef4444",
    },
    {
        key: "police",
        title: "Police",
        helper: "Police units",
        color: "#8b5cf6",
    },
    {
        key: "liveAmbulances",
        title: "Live Ambulances",
        helper: "Currently Available",
        color: "#14b8a6",
    },
];

export default function AdminDashboard() {

    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState(defaultStats);
    const [chartData, setChartData] = useState([]);
    const [selectedRange, setSelectedRange] = useState("1D");
    const [chartLoading, setChartLoading] = useState(false);
    const [activeEmergencies, setActiveEmergencies] = useState([]);
    const [activeBookings, setActiveBookings] = useState([]);
    const [mapLoading, setMapLoading] = useState(true);
    useEffect(() => {
        loadDashboard();
        loadMapData();
    }, []);

    useEffect(() => {
        loadChartData(selectedRange);
    }, [selectedRange]);
    async function loadDashboard() {

        try {

            const res = await getOverviewStats();
            setStats({
                users: res.users || 0,
                bookings: res.bookings || 0,
                hospitals: res.hospitals || 0,
                emergencies: res.emergencies || 0,
                police: res.police || 0,
                liveAmbulances: res.liveAmbulances || 0,
            });

        } catch (e) {

            console.log(getErrorMessage(e));

        } finally {

            setLoading(false);

        }
    }
    async function loadChartData(range) {
        try {
            setChartLoading(true);

            const res = await getAdminStats(range);

            const rows = Array.isArray(res)
                ? res
                : res?.data || [];

            const normalized = rows.map((row) => ({
                label:
                    row.label ||
                    row._id ||
                    row.date ||
                    "",

                users: Number(
                    row.users ??
                    row.userCount ??
                    0
                ),

                bookings: Number(
                    row.bookings ??
                    row.bookingCount ??
                    0
                ),

                hospitals: Number(
                    row.hospitals ??
                    row.hospitalCount ??
                    0
                ),

                emergencies: Number(
                    row.emergencies ??
                    row.emergencyCount ??
                    0
                ),

                police: Number(
                    row.police ??
                    row.policeCount ??
                    0
                ),
            }));

            setChartData(normalized);

        } catch (e) {
            console.log(
                "ADMIN CHART ERROR:",
                e?.response?.data ||
                getErrorMessage(e)
            );

            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    }
    async function loadMapData() {
        try {
            setMapLoading(true);

            const [
                emergencyRes,
                bookingRes,
            ] = await Promise.all([
                getActiveEmergencies(),
                getActiveBookings(),
            ]);

            console.log(
                "MAP EMERGENCIES:",
                emergencyRes
            );

            console.log(
                "MAP BOOKINGS:",
                bookingRes
            );

            const emergencies =
                emergencyRes?.emergencies ||
                emergencyRes?.requests ||
                emergencyRes?.data ||
                (Array.isArray(emergencyRes)
                    ? emergencyRes
                    : []);

            const bookings =
                bookingRes?.bookings ||
                bookingRes?.data ||
                (Array.isArray(bookingRes)
                    ? bookingRes
                    : []);

            const filteredEmergencies = emergencies.filter((item) => {
                const latitude = Number(
                    item?.location?.latitude ??
                    item?.location?.lat
                );

                const longitude = Number(
                    item?.location?.longitude ??
                    item?.location?.lng
                );

                return (
                    Number.isFinite(latitude) &&
                    Number.isFinite(longitude)
                );
            });
            const inactiveStatuses = [
                "COMPLETED",
                "CANCELLED",
                "REJECTED",
                "DECLINED",
            ];
            const filteredBookings =
                bookings.filter((item) => {
                    const status = String(
                        item?.status || ""
                    ).toUpperCase();

                    return !inactiveStatuses.includes(
                        status
                    );
                });

            setActiveEmergencies(
                filteredEmergencies
            );

            setActiveBookings(
                filteredBookings
            );

        } catch (e) {
            console.log(
                "ADMIN MAP DATA ERROR:",
                e?.response?.data ||
                getErrorMessage(e)
            );

            setActiveEmergencies([]);
            setActiveBookings([]);
        } finally {
            setMapLoading(false);
        }
    }
    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <AdminLayout
            title="Overview"
            description="Track users, bookings, hospitals and emergencies."
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
            >
                {overviewItems.map((item) => (
                    <AdminStatCard
                        key={item.key}
                        title={item.title}
                        value={stats[item.key]}
                        helper={item.helper}
                        color={item.color}
                    />
                ))}

                <AIEmergencyPanel />

                {mapLoading ? (
                    <View style={styles.mapLoader}>
                        <ActivityIndicator
                            size="large"
                            color="#2563eb"
                        />
                    </View>
                ) : (
                    <AdminLiveMap
                        emergencies={activeEmergencies}
                        bookings={activeBookings}
                    />
                )}

                {/* Combined Overview Graph */}
                {chartLoading ? (
                    <View style={styles.chartLoader}>
                        <ActivityIndicator
                            size="small"
                            color="#4f46e5"
                        />
                    </View>
                ) : (
                    <>
                        <AdminOverviewChart
                            chartData={chartData}
                            selectedRange={selectedRange}
                            onRangeChange={setSelectedRange}
                        />

                        {/* Users Graph */}
                        <AdminMetricChart
                            title="Users"
                            subtitle="Registered users over time"
                            data={chartData}
                            dataKey="users"
                            color="#6366f1"
                        />

                        {/* Bookings Graph */}
                        <AdminMetricChart
                            title="Ambulance Bookings"
                            subtitle="Booking activity over time"
                            data={chartData}
                            dataKey="bookings"
                            color="#10b981"
                        />

                        {/* Hospitals Graph */}
                        <AdminMetricChart
                            title="Hospitals"
                            subtitle="Hospital records over time"
                            data={chartData}
                            dataKey="hospitals"
                            color="#3b82f6"
                        />

                        {/* Emergencies Graph */}
                        <AdminMetricChart
                            title="Emergencies"
                            subtitle="Emergency requests over time"
                            data={chartData}
                            dataKey="emergencies"
                            color="#ef4444"
                        />

                        {/* Police Graph */}
                        <AdminMetricChart
                            title="Police"
                            subtitle="Police records over time"
                            data={chartData}
                            dataKey="police"
                            color="#8b5cf6"
                        />
                    </>
                )}

            </ScrollView>
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    scroll: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 80,
    },

    chartLoader: {
        paddingVertical: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    mapLoader: {
        height: 350,
        marginTop: 18,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },
});