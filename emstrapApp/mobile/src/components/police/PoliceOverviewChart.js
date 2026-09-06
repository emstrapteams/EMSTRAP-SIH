import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";

import { LineChart } from "react-native-gifted-charts";

const RANGES = ["1D", "1M", "3M", "6M", "1Y"];

function buildData(chartData, key) {
    return chartData.map((item) => ({
        value: Number(item?.[key] || 0),
        label: String(item?.label || ""),
    }));
}

export default function PoliceOverviewChart({
    chartData = [],
    selectedRange,
    onRangeChange,
}) {
    const usersData = buildData(
        chartData,
        "users"
    );

    const hospitalsData = buildData(
        chartData,
        "hospitals"
    );

    const emergenciesData = buildData(
        chartData,
        "emergencies"
    );

    const chartWidth = Math.max(
        300,
        chartData.length * 60
    );

    return (
        <View style={styles.container}>

            {/* TITLE */}

            <Text style={styles.heading}>
                Analytics Overview
            </Text>

            <Text style={styles.description}>
                Monitor users, hospitals and emergency activity
            </Text>

            {/* RANGE BUTTONS */}

            <View style={styles.rangeRow}>
                {RANGES.map((range) => {
                    const active =
                        selectedRange === range;

                    return (
                        <TouchableOpacity
                            key={range}
                            style={[
                                styles.rangeButton,
                                active &&
                                styles.activeRangeButton,
                            ]}
                            onPress={() =>
                                onRangeChange(range)
                            }
                        >
                            <Text
                                style={[
                                    styles.rangeText,
                                    active &&
                                    styles.activeRangeText,
                                ]}
                            >
                                {range}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {chartData.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                        No analytics data available
                    </Text>
                </View>
            ) : (
                <>
                    {/* ========================= */}
                    {/* MAIN OVERVIEW GRAPH */}
                    {/* ========================= */}

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Overview
                        </Text>

                        <Text style={styles.cardDescription}>
                            Users, hospitals and emergencies
                        </Text>

                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        {
                                            backgroundColor:
                                                "#6366f1",
                                        },
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    Users
                                </Text>
                            </View>

                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        {
                                            backgroundColor:
                                                "#10b981",
                                        },
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    Hospitals
                                </Text>
                            </View>

                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        {
                                            backgroundColor:
                                                "#ef4444",
                                        },
                                    ]}
                                />

                                <Text style={styles.legendText}>
                                    Emergencies
                                </Text>
                            </View>
                        </View>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                        >
                            <LineChart
                                data={usersData}
                                data2={hospitalsData}
                                data3={emergenciesData}

                                width={chartWidth}
                                height={220}

                                spacing={60}
                                initialSpacing={20}
                                endSpacing={30}

                                thickness={3}
                                thickness2={3}
                                thickness3={3}

                                color="#6366f1"
                                color2="#10b981"
                                color3="#ef4444"

                                dataPointsColor="#6366f1"
                                dataPointsColor2="#10b981"
                                dataPointsColor3="#ef4444"

                                dataPointsRadius={4}

                                curved

                                yAxisColor="#e5e7eb"
                                xAxisColor="#e5e7eb"

                                rulesColor="#f1f5f9"

                                yAxisTextStyle={
                                    styles.axisText
                                }

                                xAxisLabelTextStyle={
                                    styles.axisText
                                }

                                noOfSections={4}
                            />
                        </ScrollView>
                    </View>

                    {/* ========================= */}
                    {/* USERS */}
                    {/* ========================= */}

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Users
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                        >
                            <LineChart
                                data={usersData}
                                width={chartWidth}
                                height={180}
                                spacing={60}
                                initialSpacing={20}
                                endSpacing={30}

                                color="#6366f1"
                                dataPointsColor="#6366f1"

                                thickness={3}
                                dataPointsRadius={4}
                                curved
                                areaChart

                                startFillColor="#6366f1"
                                endFillColor="#ffffff"
                                startOpacity={0.18}
                                endOpacity={0}

                                yAxisColor="#e5e7eb"
                                xAxisColor="#e5e7eb"
                                rulesColor="#f1f5f9"

                                yAxisTextStyle={
                                    styles.axisText
                                }

                                xAxisLabelTextStyle={
                                    styles.axisText
                                }

                                noOfSections={4}
                            />
                        </ScrollView>
                    </View>

                    {/* ========================= */}
                    {/* HOSPITALS */}
                    {/* ========================= */}

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Hospitals
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                        >
                            <LineChart
                                data={hospitalsData}
                                width={chartWidth}
                                height={180}
                                spacing={60}
                                initialSpacing={20}
                                endSpacing={30}

                                color="#10b981"
                                dataPointsColor="#10b981"

                                thickness={3}
                                dataPointsRadius={4}
                                curved
                                areaChart

                                startFillColor="#10b981"
                                endFillColor="#ffffff"
                                startOpacity={0.18}
                                endOpacity={0}

                                yAxisColor="#e5e7eb"
                                xAxisColor="#e5e7eb"
                                rulesColor="#f1f5f9"

                                yAxisTextStyle={
                                    styles.axisText
                                }

                                xAxisLabelTextStyle={
                                    styles.axisText
                                }

                                noOfSections={4}
                            />
                        </ScrollView>
                    </View>

                    {/* ========================= */}
                    {/* EMERGENCIES */}
                    {/* ========================= */}

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Emergencies
                        </Text>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                        >
                            <LineChart
                                data={emergenciesData}
                                width={chartWidth}
                                height={180}
                                spacing={60}
                                initialSpacing={20}
                                endSpacing={30}

                                color="#ef4444"
                                dataPointsColor="#ef4444"

                                thickness={3}
                                dataPointsRadius={4}
                                curved
                                areaChart

                                startFillColor="#ef4444"
                                endFillColor="#ffffff"
                                startOpacity={0.18}
                                endOpacity={0}

                                yAxisColor="#e5e7eb"
                                xAxisColor="#e5e7eb"
                                rulesColor="#f1f5f9"

                                yAxisTextStyle={
                                    styles.axisText
                                }

                                xAxisLabelTextStyle={
                                    styles.axisText
                                }

                                noOfSections={4}
                            />
                        </ScrollView>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },

    heading: {
        fontSize: 20,
        fontWeight: "800",
        color: "#111827",
    },

    description: {
        marginTop: 4,
        marginBottom: 16,
        fontSize: 13,
        color: "#6b7280",
    },

    rangeRow: {
        flexDirection: "row",
        marginBottom: 18,
        gap: 7,
    },

    rangeButton: {
        flex: 1,
        height: 38,

        borderRadius: 9,

        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        justifyContent: "center",
        alignItems: "center",
    },

    activeRangeButton: {
        backgroundColor: "#2563eb",
        borderColor: "#2563eb",
    },

    rangeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#6b7280",
    },

    activeRangeText: {
        color: "#ffffff",
    },

    card: {
        backgroundColor: "#ffffff",

        borderRadius: 16,

        borderWidth: 1,
        borderColor: "#e5e7eb",

        paddingTop: 17,
        paddingHorizontal: 10,
        paddingBottom: 15,

        marginBottom: 15,

        overflow: "hidden",
    },

    cardTitle: {
        marginLeft: 7,

        fontSize: 16,
        fontWeight: "800",

        color: "#111827",
    },

    cardDescription: {
        marginLeft: 7,
        marginTop: 3,
        marginBottom: 12,

        fontSize: 12,
        color: "#9ca3af",
    },

    legendRow: {
        flexDirection: "row",
        flexWrap: "wrap",

        gap: 14,

        marginLeft: 7,
        marginBottom: 16,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    legendText: {
        fontSize: 11,
        color: "#6b7280",
        fontWeight: "600",
    },

    axisText: {
        fontSize: 9,
        color: "#9ca3af",
    },

    emptyCard: {
        backgroundColor: "#ffffff",

        borderWidth: 1,
        borderColor: "#e5e7eb",

        borderRadius: 16,

        paddingVertical: 40,

        justifyContent: "center",
        alignItems: "center",
    },

    emptyText: {
        fontSize: 13,
        color: "#9ca3af",
    },
});