import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    Alert,
} from "react-native";

import PoliceLayout from "../../components/police/PoliceLayout";
import PoliceStatCard from "../../components/police/PoliceStatCard";
import PoliceCaseModal from "../../components/police/PoliceCaseModal";
import PoliceCaseCard from "../../components/police/PoliceCaseCard";
import PoliceOverviewChart from "../../components/police/PoliceOverviewChart";
import PoliceMap from "../../components/police/PoliceMap";
import {
    getPoliceCases,
    updatePoliceCaseStatus,
    getPoliceOverviewStats,
    getPoliceChartStats,
    getErrorMessage,
} from "../../services/api";

const FILTERS = [
    {
        key: "ALL",
        title: "Total Cases",
        color: "#6366f1",
        backgroundColor: "#eef2ff",
    },
    {
        key: "PENDING",
        title: "Pending",
        color: "#d97706",
        backgroundColor: "#fffbeb",
    },
    {
        key: "AMBULANCE_ACCEPTED",
        title: "In Progress",
        color: "#dc2626",
        backgroundColor: "#fef2f2",
    },
    {
        key: "COMPLETED",
        title: "Resolved",
        color: "#16a34a",
        backgroundColor: "#f0fdf4",
    },
    {
        key: "CANCELLED",
        title: "Cancelled",
        color: "#475569",
        backgroundColor: "#f8fafc",
    },
];

export default function PoliceDashboard() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] =
        useState(true);

    const [statusFilter, setStatusFilter] =
        useState("ALL");
    const [selectedCase, setSelectedCase] =
        useState(null);

    const [detailsVisible, setDetailsVisible] =
        useState(false);
    const [resolvingId, setResolvingId] =
        useState(null);
    const [chartData, setChartData] =
        useState([]);

    const [selectedRange, setSelectedRange] =
        useState("1D");

    const [chartLoading, setChartLoading] =
        useState(false);
    async function loadCases() {
        try {
            setLoading(true);

            const res =
                await getPoliceCases();

            console.log(
                "POLICE CASES:",
                res
            );

            const rows =
                res?.cases ||
                res?.data ||
                (Array.isArray(res)
                    ? res
                    : []);

            setCases(rows);

        } catch (error) {
            console.log(
                "POLICE CASE ERROR:",
                error?.response?.data ||
                getErrorMessage(error)
            );

            setCases([]);
        } finally {
            setLoading(false);
        }
    }
    async function resolveCase(caseItem) {
        if (!caseItem?._id) return;

        Alert.alert(
            "Mark Case Resolved",
            "Are you sure you want to mark this case as resolved?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Resolve",
                    onPress: async () => {
                        try {
                            setResolvingId(
                                caseItem._id
                            );

                            await updatePoliceCaseStatus(
                                caseItem._id,
                                "COMPLETED"
                            );

                            // Update immediately on screen
                            setCases((previous) =>
                                previous.map((item) =>
                                    item._id ===
                                        caseItem._id
                                        ? {
                                            ...item,
                                            status:
                                                "COMPLETED",
                                        }
                                        : item
                                )
                            );

                            Alert.alert(
                                "Case Resolved",
                                "The case has been marked as resolved."
                            );
                        } catch (error) {
                            console.log(
                                "POLICE RESOLVE ERROR:",
                                error?.response?.data ||
                                getErrorMessage(
                                    error
                                )
                            );

                            Alert.alert(
                                "Unable to Resolve",
                                getErrorMessage(
                                    error,
                                    "Could not update this case."
                                )
                            );
                        } finally {
                            setResolvingId(null);
                        }
                    },
                },
            ]
        );
    }

    async function loadChartData(range) {
        try {
            setChartLoading(true);

            const res =
                await getPoliceChartStats(range);

            console.log(
                "POLICE CHART:",
                res
            );

            const rows = Array.isArray(res)
                ? res
                : res?.data ||
                res?.stats ||
                [];

            const normalized = rows.map(
                (row) => ({
                    label:
                        row?.label ||
                        row?._id ||
                        row?.date ||
                        "",

                    users: Number(
                        row?.users ??
                        row?.userCount ??
                        0
                    ),

                    hospitals: Number(
                        row?.hospitals ??
                        row?.hospitalCount ??
                        0
                    ),

                    emergencies: Number(
                        row?.emergencies ??
                        row?.emergencyCount ??
                        0
                    ),
                })
            );

            setChartData(normalized);

        } catch (error) {
            console.log(
                "POLICE CHART ERROR:",
                error?.response?.data ||
                getErrorMessage(error)
            );

            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    }
    useEffect(() => {
        loadCases();
    }, []);
    useEffect(() => {
        loadChartData(selectedRange);
    }, [selectedRange]);
    const caseStats = useMemo(
        () => ({
            ALL: cases.length,

            PENDING: cases.filter(
                (item) =>
                    item.status ===
                    "PENDING"
            ).length,

            AMBULANCE_ACCEPTED:
                cases.filter(
                    (item) =>
                        item.status ===
                        "AMBULANCE_ACCEPTED"
                ).length,

            COMPLETED: cases.filter(
                (item) =>
                    item.status ===
                    "COMPLETED"
            ).length,

            CANCELLED: cases.filter(
                (item) =>
                    item.status ===
                    "CANCELLED"
            ).length,
        }),
        [cases]
    );

    const filteredCases = useMemo(() => {
        if (statusFilter === "ALL") {
            return cases;
        }

        return cases.filter(
            (item) =>
                item.status === statusFilter
        );
    }, [cases, statusFilter]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator
                    size="large"
                    color="#2563eb"
                />

                <Text style={styles.loadingText}>
                    Loading police cases...
                </Text>
            </View>
        );
    }

    return (
        <PoliceLayout
            title="Police Dashboard"
            description="Track ambulances, monitor emergency requests and manage cases."
        >
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                    Case Overview
                </Text>

                <Text style={styles.sectionSubtitle}>
                    Tap a card to filter recent cases
                </Text>
            </View>

            <View style={styles.statsGrid}>
                {FILTERS.map((item) => (
                    <PoliceStatCard
                        key={item.key}
                        title={item.title}
                        value={
                            caseStats[item.key]
                        }
                        color={item.color}
                        backgroundColor={
                            item.backgroundColor
                        }
                        selected={
                            statusFilter ===
                            item.key
                        }
                        onPress={() =>
                            setStatusFilter(
                                item.key
                            )
                        }
                    />
                ))}
            </View>
            {chartLoading ? (
                <View style={styles.chartLoader}>
                    <ActivityIndicator
                        size="small"
                        color="#2563eb"
                    />

                    <Text style={styles.chartLoadingText}>
                        Loading analytics...
                    </Text>
                </View>
            ) : (
                <PoliceOverviewChart
                    chartData={chartData}
                    selectedRange={selectedRange}
                    onRangeChange={setSelectedRange}
                />
            )}
            <PoliceMap
                cases={cases}
                onDetails={(caseItem) => {
                    setSelectedCase(caseItem);
                    setDetailsVisible(true);
                }}
                onTrack={(caseItem) => {
                    console.log(
                        "POLICE MAP TRACK:",
                        caseItem._id
                    );
                }}
            />
            <View style={styles.recentHeader}>
                <View>
                    <Text style={styles.previewTitle}>
                        Recent Cases
                    </Text>

                    <Text style={styles.recentSubtitle}>
                        Emergency cases assigned to police
                    </Text>
                </View>

                <View style={styles.countBadge}>
                    <Text style={styles.previewCount}>
                        {filteredCases.length}
                    </Text>
                </View>
            </View>

            {filteredCases.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={34}
                        color="#9ca3af"
                    />

                    <Text style={styles.emptyTitle}>
                        No cases found
                    </Text>

                    <Text style={styles.emptyText}>
                        There are no cases matching this filter.
                    </Text>
                </View>
            ) : (
                filteredCases.map((item) => (
                    <PoliceCaseCard
                        key={item._id}
                        item={item}

                        onDetails={(caseItem) => {
                            setSelectedCase(caseItem);
                            setDetailsVisible(true);
                        }}

                        onTrack={(caseItem) => {
                            console.log(
                                "TRACK:",
                                caseItem._id
                            );
                        }}

                        onResolve={(caseItem) => {
                            resolveCase(caseItem);
                        }}
                    />
                ))
            )}
            <PoliceCaseModal
                visible={detailsVisible}
                item={selectedCase}

                onClose={() => {
                    setDetailsVisible(false);
                    setSelectedCase(null);
                }}

                onTrack={(caseItem) => {
                    console.log(
                        "TRACK:",
                        caseItem._id
                    );
                }}
            />
        </PoliceLayout>
    );
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "#f4f6f9",
    },

    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#6b7280",
    },

    sectionHeader: {
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

    sectionSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: "#6b7280",
    },

    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    recentHeader: {
        marginTop: 14,
        marginBottom: 14,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    recentSubtitle: {
        marginTop: 3,
        fontSize: 12,
        color: "#6b7280",
    },

    countBadge: {
        minWidth: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#eef2ff",

        justifyContent: "center",
        alignItems: "center",
    },

    previewTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111827",
    },

    previewCount: {
        fontSize: 13,
        fontWeight: "800",
        color: "#4f46e5",
    },

    emptyCard: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 16,

        paddingVertical: 35,
        paddingHorizontal: 20,

        alignItems: "center",
    },

    emptyTitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "700",
        color: "#374151",
    },

    emptyText: {
        marginTop: 5,
        fontSize: 13,
        color: "#9ca3af",
        textAlign: "center",
    },

    previewTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#111827",
    },

    previewCount: {
        fontSize: 13,
        fontWeight: "700",
        color: "#6b7280",
    },
    chartLoader: {
        minHeight: 150,
        marginTop: 20,

        backgroundColor: "#ffffff",
        borderRadius: 16,

        justifyContent: "center",
        alignItems: "center",

        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    chartLoadingText: {
        marginTop: 10,
        fontSize: 13,
        color: "#6b7280",
    },
});